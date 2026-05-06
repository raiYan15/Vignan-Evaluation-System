from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] in {"success", "pending_review"}
        assert "data" in payload
        assert "engine_mode" in payload["data"]
