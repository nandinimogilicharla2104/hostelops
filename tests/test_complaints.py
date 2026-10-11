
from app.main import app
from app.core.security import create_access_token
from app.models.technician import Technician
from app.models.technician_skill import TechnicianSkill
from app.models.user import User
from app.models.hostel import Hostel, HostelType


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



def test_assign_complaint_to_available_technician(
    client, test_data
):
    warden = test_data["warden"]
    complaint = test_data["complaint"]
    technician = test_data["technician"]

    token = create_access_token(warden.id)

    response = client.post(
        f"/complaints/{complaint.id}/assign",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ASSIGNED"
    assert data["assigned_technician_id"] == technician.user_id



def test_assignment_prefers_lower_workload(
    client, test_data, db
):
    warden = test_data["warden"]
    complaint = test_data["complaint"]
    original_technician = test_data["technician"]

    # Make the original technician busier.
    original_technician.current_workload = 5

    # Create another technician in the same hostel.
    second_user = User(
        name="Second Technician",
        email="second-technician@test.com",
        phone="9000000005",
        password_hash="test_hash",
        role="technician",
        hostel_id=test_data["hostel"].id,
        is_active=True,
    )
    db.add(second_user)
    db.flush()

    second_technician = Technician(
        user_id=second_user.id,
        employee_id="TEST-TECH-002",
        availability_status="AVAILABLE",
        current_workload=0,
        hostel_id=test_data["hostel"].id,
    )
    db.add(second_technician)
    db.flush()

    db.add(
        TechnicianSkill(
            technician_id=second_technician.id,
            category_id=test_data["category"].id,
            skill_level=3,
        )
    )
    db.commit()

    token = create_access_token(warden.id)

    response = client.post(
        f"/complaints/{complaint.id}/assign",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["assigned_technician_id"] == second_user.id


def test_assignment_skips_unavailable_technician(
    client, test_data, db
):
    warden = test_data["warden"]
    complaint = test_data["complaint"]
    technician = test_data["technician_user"]

    # Make the existing qualified technician unavailable.
    technician_record = db.query(Technician).filter(
        Technician.user_id == technician.id
    ).first()
    technician_record.availability_status = "UNAVAILABLE"

    # Create another qualified, available technician.
    second_user = User(
        name="Available Technician",
        email="available-technician@test.com",
        phone="9000000006",
        password_hash="test_hash",
        role="technician",
        hostel_id=test_data["hostel"].id,
        is_active=True,
    )
    db.add(second_user)
    db.flush()

    second_technician = Technician(
        user_id=second_user.id,
        employee_id="TEST-TECH-003",
        availability_status="AVAILABLE",
        current_workload=4,
        hostel_id=test_data["hostel"].id,
    )
    db.add(second_technician)
    db.flush()

    db.add(
        TechnicianSkill(
            technician_id=second_technician.id,
            category_id=test_data["category"].id,
            skill_level=3,
        )
    )
    db.commit()

    token = create_access_token(warden.id)
    response = client.post(
        f"/complaints/{complaint.id}/assign",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["assigned_technician_id"] == second_user.id


def test_assignment_prefers_same_hostel(
    client, test_data, db
):
    warden = test_data["warden"]
    complaint = test_data["complaint"]
    hostel = test_data["hostel"]
    category = test_data["category"]

    # Create a technician belonging to another hostel.
    other_hostel = Hostel(
        name="Other Test Hostel",
        location="Other Campus",
        type=HostelType.BOYS,
    )
    db.add(other_hostel)
    db.flush()

    other_user = User(
        name="Other Hostel Technician",
        email="other-hostel-tech@test.com",
        phone="9000000007",
        password_hash="test_hash",
        role="technician",
        hostel_id=other_hostel.id,
        is_active=True,
    )
    db.add(other_user)
    db.flush()

    other_technician = Technician(
        user_id=other_user.id,
        employee_id="TEST-TECH-004",
        availability_status="AVAILABLE",
        current_workload=0,
        hostel_id=other_hostel.id,
    )
    db.add(other_technician)
    db.flush()

    db.add(
        TechnicianSkill(
            technician_id=other_technician.id,
            category_id=category.id,
            skill_level=3,
        )
    )
    db.commit()

    token = create_access_token(warden.id)
    response = client.post(
        f"/complaints/{complaint.id}/assign",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    # The existing qualified technician belongs to the complaint's hostel.
    assert (
        response.json()["assigned_technician_id"]
        == test_data["technician_user"].id
    )




def test_assigned_complaint_cannot_be_assigned_again(
    client, test_data, db
):
    warden = test_data["warden"]
    complaint = test_data["complaint"]
    technician_user = test_data["technician_user"]
    technician_record = test_data["technician"]

    complaint.assigned_technician_id = technician_user.id
    complaint.status = "ASSIGNED"
    technician_record.current_workload = 3
    db.commit()

    token = create_access_token(warden.id)

    response = client.post(
        f"/complaints/{complaint.id}/assign",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400

    db.refresh(technician_record)
    assert technician_record.current_workload == 3



def test_high_priority_prefers_higher_skill_technician(
    client, test_data, db
):
    warden = test_data["warden"]
    complaint = test_data["complaint"]
    category = test_data["category"]
    hostel = test_data["hostel"]

    # Existing technician has skill level 2.
    existing_technician = test_data["technician"]
    existing_skill = db.query(TechnicianSkill).filter(
        TechnicianSkill.technician_id == existing_technician.id,
        TechnicianSkill.category_id == category.id,
    ).first()
    existing_skill.skill_level = 2

    # Create a second technician with skill level 3.
    second_user = User(
        name="High Skill Technician",
        email="high-skill-tech@test.com",
        phone="9000000008",
        password_hash="test_hash",
        role="technician",
        hostel_id=hostel.id,
        is_active=True,
    )
    db.add(second_user)
    db.flush()

    second_technician = Technician(
        user_id=second_user.id,
        employee_id="TEST-TECH-005",
        availability_status="AVAILABLE",
        current_workload=0,
        hostel_id=hostel.id,
    )
    db.add(second_technician)
    db.flush()

    db.add(
        TechnicianSkill(
            technician_id=second_technician.id,
            category_id=category.id,
            skill_level=3,
        )
    )

    complaint.priority = "HIGH"
    db.commit()

    token = create_access_token(warden.id)
    response = client.post(
        f"/complaints/{complaint.id}/assign",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["assigned_technician_id"] == second_user.id
