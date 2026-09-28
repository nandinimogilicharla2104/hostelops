from sqlalchemy.orm import Session

from app.models.room_assignment import RoomAssignment
from app.schemas.room_assignment import RoomAssignmentCreate


def create_room_assignment(
    db: Session,
    assignment_data: RoomAssignmentCreate
) -> RoomAssignment:

    active_assignment = (
        db.query(RoomAssignment)
        .filter(
            RoomAssignment.user_id == assignment_data.user_id,
            RoomAssignment.is_active.is_(True)
        )
        .first()
    )

    if active_assignment is not None:
        if active_assignment.room_id == assignment_data.room_id:
            raise ValueError(
                "Student is already assigned to this room"
            )

        active_assignment.is_active = False

    assignment = RoomAssignment(
        user_id=assignment_data.user_id,
        room_id=assignment_data.room_id
    )


    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment


def get_all_room_assignments(
    db: Session
) -> list[RoomAssignment]:

    return db.query(RoomAssignment).all()


def get_room_assignment_by_id(
    db: Session,
    assignment_id: int
) -> RoomAssignment | None:

    return (
        db.query(RoomAssignment)
        .filter(RoomAssignment.id == assignment_id)
        .first()
    )
def get_active_room_assignment(
    db: Session,
    user_id: int
) -> RoomAssignment | None:

    
    return (
        db.query(RoomAssignment)
        .filter(
            RoomAssignment.user_id == user_id,
            RoomAssignment.is_active == True
        )
        .first()
    )
