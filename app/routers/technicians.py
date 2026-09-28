from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_role

from app.database.connection import get_db
from app.models.user import User
from app.schemas.technician import (
    TechnicianCreate,
    TechnicianResponse,
)

from app.services.technician_service import (
    create_technician,
    get_all_technicians,
)

from app.schemas.technician import TechnicianStatusUpdate
from app.services.technician_service import update_technician_status


router = APIRouter(
    prefix="/technicians",
    tags=["Technicians"]
)


@router.post(
    "",
    response_model=TechnicianResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_technician(
    technician_data: TechnicianCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    try:
        return create_technician(
            db=db,
            technician_data=technician_data
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.get(
    "",
    response_model=list[TechnicianResponse]
)
def get_technicians(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "warden"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view technicians"
        )

    return get_all_technicians(db)

@router.patch("/{technician_id}/status", response_model=TechnicianResponse)
def update_status(
    technician_id: int,
    status_data: TechnicianStatusUpdate,
    current_user: User = Depends(require_role("warden")),
    db: Session = Depends(get_db)
):
    try:
        return update_technician_status(
            db=db,
            technician_id=technician_id,
            availability_status=status_data.availability_status
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    