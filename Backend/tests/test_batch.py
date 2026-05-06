from fastapi.testclient import TestClient

from app.main import app


def _faculty_auth_headers(client: TestClient) -> dict[str, str]:
    client.post(
        "/auth/register/faculty",
        json={
            "name": "Faculty Batch",
            "faculty_id": "FAC-002",
            "email": "faculty.batch@example.com",
            "password": "Password@123",
            "department": "IT",
        },
    )
    login = client.post(
        "/auth/login",
        json={"email": "faculty.batch@example.com", "password": "Password@123"},
    )
    token = login.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_batch_evaluate():
    with TestClient(app) as client:
        headers = _faculty_auth_headers(client)
        files = [
            ("files", ("1.png", b"img-1", "image/png")),
            ("files", ("2.png", b"img-2", "image/png")),
        ]
        response = client.post("/evaluate/batch", files=files, headers=headers)
        assert response.status_code == 200
        payload = response.json()
        assert "items" in payload["data"]
        assert len(payload["data"]["items"]) == 2
