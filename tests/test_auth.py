
from app.main import app
from app.core.security import create_access_token




def test_users_me_without_token(client):
    response = client.get("/users/me")

    assert response.status_code == 401


def test_users_me_with_valid_token(client,warden):
    token = create_access_token(warden.id)

    response = client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200
    response.json()["user"]["id"] == warden.id