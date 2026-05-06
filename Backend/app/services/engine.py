from __future__ import annotations

import asyncio
import hashlib
import logging
import pickle
import time
from pathlib import Path
from typing import Any

from app.core.config import Settings
from app.services.orchestrator import PADCOMOrchestrator
from app.utils.time import stage

logger = logging.getLogger(__name__)


class EvaluationEngine:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.orchestrator = PADCOMOrchestrator()
        self.mode = self._detect_mode(settings.engine_mode)
        self.trained_model: dict[str, Any] | None = None
        self.trained_pipeline: Any | None = None
        self.handwriting_model: Any | None = None
        self.handwriting_model_id: str | None = None

    @property
    def handwriting_model_loaded(self) -> bool:
        return self.handwriting_model is not None

    @staticmethod
    def _rubric_ranges() -> dict[str, tuple[float, float]]:
        return {
            "concept_coverage": (0.0, 4.0),
            "correctness": (0.0, 3.0),
            "depth": (0.0, 2.0),
            "relevance": (0.0, 1.0),
        }

    @staticmethod
    def _candidate_paths(configured: str, fallback_relative: str) -> list[Path]:
        configured = (configured or "").strip() or fallback_relative

        configured_path = Path(configured)
        candidates: list[Path] = []
        if configured_path.is_absolute():
            candidates.append(configured_path)
        else:
            cwd = Path.cwd()
            candidates.extend(
                [
                    (cwd / configured_path),
                    (cwd / "Backend" / configured_path),
                ]
            )

        # de-duplicate while preserving order
        deduped: list[Path] = []
        seen: set[str] = set()
        for path in candidates:
            key = str(path.resolve()) if path.exists() else str(path)
            if key in seen:
                continue
            seen.add(key)
            deduped.append(path)
        return deduped

    def _candidate_model_paths(self) -> list[Path]:
        return self._candidate_paths(self.settings.trained_model_path, "results/answer_evaluator_model.pkl")

    def _candidate_handwriting_model_paths(self) -> list[Path]:
        return self._candidate_paths(self.settings.handwriting_model_path, "results/handwriting_recognition_model.pkl")

    def _load_trained_model(self) -> None:
        self.trained_model = None
        self.trained_pipeline = None

        if not self.settings.trained_model_enabled:
            logger.info("Trained model integration disabled")
            return

        for path in self._candidate_model_paths():
            if not path.exists() or not path.is_file():
                continue
            try:
                with path.open("rb") as f:
                    artifact = pickle.load(f)
                if isinstance(artifact, dict) and artifact.get("pipeline") is not None:
                    self.trained_model = artifact
                    self.trained_pipeline = artifact.get("pipeline")
                    logger.info(
                        "Trained model loaded",
                        extra={
                            "extra_fields": {
                                "model_path": str(path),
                                "model_id": artifact.get("model_id"),
                            }
                        },
                    )
                    return
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "Failed loading trained model",
                    extra={"extra_fields": {"model_path": str(path), "error": str(exc)}},
                )

        logger.info("No trained model artifact found; using existing evaluation pipeline")

    def _load_handwriting_model(self) -> None:
        self.handwriting_model = None
        self.handwriting_model_id = None

        if not self.settings.handwriting_model_enabled:
            logger.info("Handwriting model integration disabled")
            return

        for path in self._candidate_handwriting_model_paths():
            if not path.exists() or not path.is_file():
                continue
            try:
                with path.open("rb") as f:
                    artifact = pickle.load(f)

                model = artifact
                model_id: str | None = None
                if isinstance(artifact, dict):
                    model = artifact.get("recognizer") or artifact.get("model") or artifact.get("pipeline")
                    model_id = str(artifact.get("model_id") or "").strip() or None

                if model is None:
                    continue

                self.handwriting_model = model
                self.handwriting_model_id = model_id
                logger.info(
                    "Handwriting model loaded",
                    extra={
                        "extra_fields": {
                            "model_path": str(path),
                            "model_id": model_id,
                        }
                    },
                )
                return
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "Failed loading handwriting model",
                    extra={"extra_fields": {"model_path": str(path), "error": str(exc)}},
                )

        logger.info("No handwriting model artifact found; using existing recognized_text")

    def _run_handwriting_model(self, image_bytes: bytes) -> tuple[str, float | None] | None:
        model = self.handwriting_model
        if model is None:
            return None

        output: Any
        try:
            if hasattr(model, "recognize"):
                output = model.recognize(image_bytes)
            elif hasattr(model, "predict_text"):
                output = model.predict_text(image_bytes)
            elif hasattr(model, "predict"):
                output = model.predict(image_bytes)
            elif callable(model):
                output = model(image_bytes)
            else:
                return None
        except Exception as exc:  # noqa: BLE001
            logger.warning("Handwriting model inference failed", extra={"extra_fields": {"error": str(exc)}})
            return None

        # Supported returns:
        # - "text"
        # - ("text", confidence)
        # - {"text": "...", "confidence": 0.9}
        text = ""
        confidence: float | None = None

        if isinstance(output, str):
            text = output.strip()
        elif isinstance(output, tuple) and output:
            text = str(output[0]).strip()
            if len(output) > 1:
                try:
                    confidence = float(output[1])
                except Exception:  # noqa: BLE001
                    confidence = None
        elif isinstance(output, list) and output:
            text = str(output[0]).strip()
        elif isinstance(output, dict):
            text = str(output.get("text") or output.get("recognized_text") or "").strip()
            conf_val = output.get("confidence") or output.get("htr_confidence")
            if conf_val is not None:
                try:
                    confidence = float(conf_val)
                except Exception:  # noqa: BLE001
                    confidence = None

        if not text:
            return None
        return text, confidence

    def _apply_handwriting_model(self, result: dict[str, Any], image_bytes: bytes) -> dict[str, Any]:
        predicted = self._run_handwriting_model(image_bytes)
        if predicted is None:
            return result

        text, confidence = predicted
        result["recognized_text"] = text
        if confidence is not None:
            result["htr_confidence"] = round(min(1.0, max(0.0, confidence)), 4)
        result["htr_model_source"] = "trained_htr"
        result["htr_model_id"] = self.handwriting_model_id
        return result

    @staticmethod
    def _extract_model_inputs(rubric: dict[str, Any] | None, recognized_text: str) -> tuple[str, str, str] | None:
        if not rubric:
            return None
        question = str(rubric.get("question", "")).strip()
        reference = str(rubric.get("reference_answer") or rubric.get("model_answer") or "").strip()
        student_answer = str(recognized_text or "").strip()
        if not question or not reference or not student_answer:
            return None
        return question, reference, student_answer

    def _apply_trained_model_scores(self, result: dict[str, Any], rubric: dict[str, Any] | None) -> dict[str, Any]:
        if self.trained_pipeline is None:
            return result

        extracted = self._extract_model_inputs(rubric, str(result.get("recognized_text", "")))
        if extracted is None:
            return result

        question, reference, student_answer = extracted
        text_input = f"Question: {question}\nReference: {reference}\nStudent: {student_answer}"

        try:
            pred = self.trained_pipeline.predict([text_input])[0]
            target_columns = (self.trained_model or {}).get(
                "target_columns", ["concept_coverage", "correctness", "depth", "relevance"]
            )
            ranges = self._rubric_ranges()

            components: dict[str, float] = {}
            for idx, col in enumerate(target_columns):
                low, high = ranges.get(col, (0.0, 10.0))
                raw_val = float(pred[idx]) if idx < len(pred) else 0.0
                components[col] = min(high, max(low, raw_val))

            concept = components.get("concept_coverage", 0.0)
            correctness = components.get("correctness", 0.0)
            depth = components.get("depth", 0.0)
            relevance = components.get("relevance", 0.0)
            total_10 = concept + correctness + depth + relevance
            overall = min(1.0, max(0.0, total_10 / 10.0))

            max_marks = float(result.get("max_marks", (rubric or {}).get("max_marks", 10) or 10))
            final_marks = round(overall * max_marks, 2)

            result["semantic_score"] = round(min(1.0, max(0.0, (concept + correctness) / 7.0)), 4)
            result["keyword_score"] = round(min(1.0, max(0.0, (depth + relevance) / 3.0)), 4)
            result["overall_confidence"] = round(overall, 4)
            result["final_marks"] = final_marks
            result["needs_manual_review"] = overall < self.settings.confidence_threshold
            result["status"] = "pending_review" if result["needs_manual_review"] else "success"
            result["feedback"] = (
                "Scored with trained rubric model. "
                f"Coverage={concept:.2f}/4, Correctness={correctness:.2f}/3, Depth={depth:.2f}/2, Relevance={relevance:.2f}/1."
            )
            result["model_breakdown"] = {
                "concept_coverage": round(concept, 4),
                "correctness": round(correctness, 4),
                "depth": round(depth, 4),
                "relevance": round(relevance, 4),
            }
            result["model_source"] = "trained_pkl"
            result["model_id"] = (self.trained_model or {}).get("model_id")
        except Exception as exc:  # noqa: BLE001
            logger.warning("Trained model scoring failed; keeping base result", extra={"extra_fields": {"error": str(exc)}})
        return result

    def _detect_mode(self, desired_mode: str) -> str:
        if desired_mode in {"mock", "real"}:
            return desired_mode
        try:
            __import__("vision")
            __import__("nlp")
            __import__("scoring")
            return "real"
        except Exception:  # noqa: BLE001
            return "mock"

    async def warmup(self) -> None:
        self._load_handwriting_model()
        self._load_trained_model()
        logger.info("Engine warmup complete", extra={"extra_fields": {"engine_mode": self.mode}})

    async def evaluate(
        self,
        image_bytes: bytes,
        rubric: dict[str, Any] | None = None,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        stages: dict[str, float] = {}
        start = time.perf_counter()
        try:
            with stage(stages, "total"):
                result = await asyncio.wait_for(
                    self._evaluate_internal(image_bytes=image_bytes, rubric=rubric, stages=stages),
                    timeout=self.settings.engine_timeout_seconds,
                )
            processing_time = round((time.perf_counter() - start) * 1000, 2)
            result["processing_time"] = processing_time
            result["stage_timings_ms"] = stages
            logger.info(
                "Evaluation complete",
                extra={
                    "extra_fields": {
                        "engine_mode": self.mode,
                        "request_id": request_id,
                        "processing_time_ms": processing_time,
                    }
                },
            )
            return result
        except TimeoutError as exc:
            raise RuntimeError("Evaluation timed out") from exc
        except Exception as exc:  # noqa: BLE001
            raise RuntimeError(f"Evaluation failed: {exc}") from exc

    async def _evaluate_internal(
        self,
        image_bytes: bytes,
        rubric: dict[str, Any] | None,
        stages: dict[str, float],
    ) -> dict[str, Any]:
        if self.mode == "mock":
            with stage(stages, "mock_pipeline"):
                result = self._deterministic_mock(image_bytes, rubric)
                result = self._apply_handwriting_model(result, image_bytes)
                return self._apply_trained_model_scores(result, rubric)

        with stage(stages, "real_pipeline"):
            result = await self.orchestrator.process(image_bytes, rubric)
            result = self._apply_handwriting_model(result, image_bytes)
            return self._apply_trained_model_scores(result, rubric)

    def _deterministic_mock(self, image_bytes: bytes, rubric: dict[str, Any] | None) -> dict[str, Any]:
        digest = hashlib.sha256(image_bytes).hexdigest()
        seed = int(digest[:8], 16)
        semantic = round(0.5 + (seed % 30) / 100, 4)
        keyword = round(0.45 + (seed % 40) / 100, 4)
        htr = round(0.6 + (seed % 25) / 100, 4)
        overall = round((semantic * 0.6 + keyword * 0.25 + htr * 0.15), 4)
        max_marks = float((rubric or {}).get("max_marks", 10))
        final_marks = round(overall * max_marks, 2)
        result = {
            "recognized_text": f"mock-recognized-{digest[:12]}",
            "htr_confidence": htr,
            "semantic_score": semantic,
            "keyword_score": keyword,
            "final_marks": final_marks,
            "max_marks": max_marks,
            "overall_confidence": overall,
            "needs_manual_review": overall < self.settings.confidence_threshold,
            "feedback": "Auto-graded via deterministic mock engine.",
            "status": "pending_review" if overall < self.settings.confidence_threshold else "success",
        }
        return result
