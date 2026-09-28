from sqlalchemy.orm import Session

from app.models.technician import Technician
from app.schemas.technician import TechnicianCreate
from app.models.user import User
from app.models.hostel import Hostel


def create_technician(
    db: Session,
    technician_data: TechnicianCreate
) -> Technician:

    user = db.query(User).filter(
        User.id == technician_data.user_id
    ).first()

    if user is None:
        raise ValueError("User not found")

    if user.role != "technician":
        raise ValueError("User must have technician role")

    hostel = db.query(Hostel).filter(
        Hostel.id == technician_data.hostel_id
    ).first()

    if hostel is None:
        raise ValueError("Hostel not found")
    
    technician = Technician(
        user_id=technician_data.user_id,
        employee_id=technician_data.employee_id,
        hostel_id=technician_data.hostel_id
    )

    db.add(technician)
    db.commit()
    db.refresh(technician)

    return technician


def get_all_technicians(
    db: Session
) -> list[Technician]:

    return db.query(Technician).all()

def update_technician_status(
    db: Session,
    technician_id: int,
    availability_status: str
) -> Technician:

    technician = db.query(Technician).filter(
        Technician.id == technician_id
    ).first()

    if technician is None:
        raise ValueError("Technician not found")

    technician.availability_status = availability_status

    db.commit()
    db.refresh(technician)

    return technician


