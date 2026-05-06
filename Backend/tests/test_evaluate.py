from fastapi.testclient import TestClient

from app.main import app


def _faculty_auth_headers(client: TestClient) -> dict[str, str]:
    client.post(
        "/auth/register/faculty",
        json={
            "name": "Faculty Tester",
            "faculty_id": "FAC-001",
            "email": "faculty.tester@example.com",
            "password": "Password@123",
            "department": "CSE",
        },
    )
    login = client.post(
        "/auth/login",
        json={"email": "faculty.tester@example.com", "password": "Password@123"},
    )
    token = login.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_single_evaluate():
    with TestClient(app) as client:
        headers = _faculty_auth_headers(client)
        files = {"file": ("ans.png", b"fake-image-bytes", "image/png")}
        response = client.post("/evaluate", files=files, headers=headers)
        assert response.status_code == 200
        payload = response.json()
        assert payload["data"]["final_marks"] >= 0
        assert "request_id" in payload
