import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)


def test_signup_for_activity():
    activity_name = "Chess Club"
    email = "test@example.com"

    # Sign up for an activity
    response = client.post(f"/activities/{activity_name}/signup", json={"email": email})
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity_name}"


def test_unregister_participant():
    activity_name = "Chess Club"
    email = "test@example.com"

    # Unregister from an activity
    response = client.post(f"/activities/{activity_name}/unregister", json={"email": email})
    assert response.status_code == 200
    assert response.json()["message"] == f"Unregistered {email} from {activity_name}"