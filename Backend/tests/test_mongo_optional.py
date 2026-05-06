from fastapi.testclient import TestClient

from app.main import app


def test_stats_works_without_mongo():
    with TestClient(app) as client:
        response = client.get("/stats")
        assert response.status_code == 200
        payload = response.json()
        assert payload["data"]["total_evaluations"] >= 0