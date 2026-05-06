from fastapi.testclient import TestClient

from app.main import app


def client() -> TestClient:
    return TestClient(app)
