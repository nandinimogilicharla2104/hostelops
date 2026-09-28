from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.room import RoomCreate, RoomResponse
from app.services.room_service import (
    create_room,
    get_all_rooms,
    get_room_by_id,
)
from app.services.block_service import get_block_by_id


router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


@router.post(
    "",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED
)
def create_room_endpoint(
    room_data: RoomCreate,
    db: Session = Depends(get_db)
):
    block = get_block_by_id(db, room_data.block_id)

    if block is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Block not found"
        )

    return create_room(db, room_data)


@router.get(
    "",
    response_model=list[RoomResponse]
)
def get_rooms(
    db: Session = Depends(get_db)
):
    return get_all_rooms(db)


@router.get(
    "/{room_id}",
    response_model=RoomResponse
)
def get_room(
    room_id: int,
    db: Session = Depends(get_db)
):
    room = get_room_by_id(db, room_id)

    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    return room