from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.services.dashboard_service import (
    get_technician_dashboard,
    get_warden_dashboard
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/technician")
def technician_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "technician":
        raise HTTPException(
            status_code=403,
            detail="Only technicians can access this dashboard"
        )

    return get_technician_dashboard(
        db=db,
        technician_user_id=current_user.id
    )

@router.get("/warden")
def warden_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "warden":
        raise HTTPException(
            status_code=403,
            detail="Only wardens can access this dashboard"
        )

    if current_user.hostel_id is None:
        raise HTTPException(
            status_code=400,
            detail="Warden is not assigned to a hostel"
        )

    return get_warden_dashboard(
        db=db,
        hostel_id=current_user.hostel_id
    )
