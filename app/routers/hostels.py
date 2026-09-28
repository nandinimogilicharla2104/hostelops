from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.hostel import HostelCreate, HostelResponse
from app.services.hostel_service import (
    create_hostel,
    get_all_hostels,
    get_hostel_by_id,
    get_hostel_by_name
)
from fastapi import APIRouter, Depends, HTTPException, status


router = APIRouter(
    prefix="/hostels",
    tags=["Hostels"]
)


@router.post(
    "",
    response_model=HostelResponse,
    status_code=status.HTTP_201_CREATED
)
def create_hostel_endpoint(
    hostel_data: HostelCreate,
    db: Session = Depends(get_db)
):
    existing_hostel = get_hostel_by_name(
        db,
        hostel_data.name
    )

    if existing_hostel:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Hostel with this name already exists"
        )

    return create_hostel(
        db,
        hostel_data
    )

@router.get(
    "",
    response_model=list[HostelResponse]
)
def get_hostels(
    db: Session = Depends(get_db)
):
    return get_all_hostels(db)

@router.get(
    "/{hostel_id}",
    response_model=HostelResponse
)
def get_hostel(
    hostel_id: int,
    db: Session = Depends(get_db)
):
    hostel = get_hostel_by_id(
        db,
        hostel_id
    )

    if hostel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel not found"
        )

    return hostel