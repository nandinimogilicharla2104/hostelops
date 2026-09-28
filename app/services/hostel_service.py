from sqlalchemy.orm import Session

from app.models.hostel import Hostel
from app.schemas.hostel import HostelCreate


def create_hostel(
    db: Session,
    hostel_data: HostelCreate
) -> Hostel:

    hostel = Hostel(
        name=hostel_data.name,
        location=hostel_data.location,
        type=hostel_data.type
    )

    db.add(hostel)
    db.commit()
    db.refresh(hostel)

    return hostel


def get_all_hostels(
    db: Session
) -> list[Hostel]:

    return db.query(Hostel).all()

def get_hostel_by_id(
    db: Session,
    hostel_id: int
) -> Hostel | None:

    return (
        db.query(Hostel)
        .filter(Hostel.id == hostel_id)
        .first()
    )


def get_hostel_by_name(
    db: Session,
    name: str
) -> Hostel | None:

    return (
        db.query(Hostel)
        .filter(Hostel.name == name)
        .first()
    )