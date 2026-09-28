
from app.main import app
from app.core.security import create_access_token



def test_warden_dashboard(client,warden):
    token = create_access_token(warden.id)

    response = client.get(
        "/dashboard/warden",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200


def test_technician_cannot_access_warden_dashboard(client,technician):
    token = create_access_token(technician.id)

    response = client.get(
        "/dashboard/warden",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403


def test_technician_dashboard(client,technician):
    token = create_access_token(technician.id)

    response = client.get(
        "/dashboard/technician",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

