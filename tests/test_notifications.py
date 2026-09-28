from app.core.security import create_access_token


def test_cannot_mark_another_users_notification_as_read(
    client,
    warden,
    test_data
):
    token = create_access_token(warden.id)

    notification_id = test_data["notification"].id

    response = client.patch(
        f"/notifications/{notification_id}/read",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 404


def test_get_user_notifications(client, technician):
    token = create_access_token(technician.id)

    response = client.get(
        "/notifications",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_notifications_without_token(client):
    response = client.get("/notifications")

    assert response.status_code == 401