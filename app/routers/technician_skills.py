from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role,get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.technician_skill import (
    TechnicianSkillCreate,
    TechnicianSkillResponse,
)
from app.services.technician_skill_service import (
    create_technician_skill,
    get_all_technician_skills,
    get_skills_by_technician,
    get_skills_by_category,
    get_qualified_technicians,
)

from app.schemas.technician import TechnicianResponse



router = APIRouter(
    prefix="/technician-skills",
    tags=["Technician Skills"]
)


@router.post(
    "",
    response_model=TechnicianSkillResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_technician_skill(
    skill_data: TechnicianSkillCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    try:
        return create_technician_skill(
            db=db,
            skill_data=skill_data
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.get(
    "",
    response_model=list[TechnicianSkillResponse]
)
def get_technician_skills(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return get_all_technician_skills(db)


@router.get(
    "/technician/{technician_id}",
    response_model=list[TechnicianSkillResponse]
)
def get_skills_for_technician(
    technician_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return get_skills_by_technician(
        db=db,
        technician_id=technician_id
    )


@router.get(
    "/category/{category_id}",
    response_model=list[TechnicianSkillResponse]
)
def get_skills_for_category(
    category_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return get_skills_by_category(
        db=db,
        category_id=category_id
    )

@router.get(
    "/qualified/{category_id}",
    response_model=list[TechnicianResponse]
)
def get_qualified(
    category_id: int,
    hostel_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "warden"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view qualified technicians"
        )

    return get_qualified_technicians(
        db=db,
        category_id=category_id,
        hostel_id=hostel_id
    )




