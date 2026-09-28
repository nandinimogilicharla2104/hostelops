from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.room_assignment import (
    RoomAssignmentCreate,
    RoomAssignmentResponse,
)
from app.services.room_assignment_service import (
    create_room_assignment,
    get_all_room_assignments,
    get_room_assignment_by_id,
)
from app.models.user import User
from app.services.room_service import get_room_by_id


router = APIRouter(
    prefix="/room-assignments",
    tags=["Room Assignments"]
)


@router.post(
    "",
    response_model=RoomAssignmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_room_assignment_endpoint(
    assignment_data: RoomAssignmentCreate,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == assignment_data.user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    room = get_room_by_id(db, assignment_data.room_id)

    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    try:
        return create_room_assignment(
            db=db,
            assignment_data=assignment_data
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get(
    "",
    response_model=list[RoomAssignmentResponse]
)
def get_room_assignments(
    db: Session = Depends(get_db)
):
    return get_all_room_assignments(db)


@router.get(
    "/{assignment_id}",
    response_model=RoomAssignmentResponse
)
def get_room_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    assignment = get_room_assignment_by_id(
        db,
        assignment_id
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room assignment not found"
        )

    return assignment