from sqlalchemy.orm import Session

from app.models.room import Room
from app.schemas.room import RoomCreate


def create_room(
    db: Session,
    room_data: RoomCreate
) -> Room:

    room = Room(
        room_number=room_data.room_number,
        block_id=room_data.block_id
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    return room


def get_all_rooms(db: Session) -> list[Room]:
    return db.query(Room).all()


def get_room_by_id(
    db: Session,
    room_id: int
) -> Room | None:

    return (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )