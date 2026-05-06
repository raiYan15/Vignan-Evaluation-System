import asyncio
import pickle

from app.core.config import Settings
from app.services.engine import EvaluationEngine


def test_mock_engine_deterministic():
    settings = Settings(ENGINE_MODE="mock")
    engine = EvaluationEngine(settings)
    one = asyncio.run(engine.evaluate(b"same-bytes"))
    two = asyncio.run(engine.evaluate(b"same-bytes"))
    assert one["final_marks"] == two["final_marks"]
    assert one["recognized_text"] == two["recognized_text"]


class DummyHtrModel:
    def recognize(self, image_bytes: bytes) -> tuple[str, float]:
        return (f"decoded-{len(image_bytes)}", 0.93)


def test_handwriting_model_applied(tmp_path):
    model_path = tmp_path / "htr.pkl"
    with model_path.open("wb") as f:
        pickle.dump({"recognizer": DummyHtrModel(), "model_id": "htr-1"}, f)

    settings = Settings(
        ENGINE_MODE="mock",
        HANDWRITING_MODEL_ENABLED=True,
        HANDWRITING_MODEL_PATH=str(model_path),
        TRAINED_MODEL_ENABLED=False,
    )
    engine = EvaluationEngine(settings)
    asyncio.run(engine.warmup())

    result = asyncio.run(engine.evaluate(b"abc123"))
    assert result["recognized_text"] == "decoded-6"
    assert result["htr_confidence"] == 0.93
    assert result["htr_model_source"] == "trained_htr"
