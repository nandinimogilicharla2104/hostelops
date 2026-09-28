
from app.main import app
from app.core.security import create_access_token


def test_invalid_complaint_status_transition(client,warden, complaint):
    token = create_access_token(warden.id)

    response = client.patch(
        f"/complaints/{complaint.id}/status",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "status": "CLOSED"
        }
    )

    assert response.status_code == 400

def test_get_complaint_history(client,warden, complaint):
    token = create_access_token(warden.id)

    response = client.get(
        f"/complaints/{complaint.id}/history",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)

