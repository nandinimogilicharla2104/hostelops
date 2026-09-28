from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.complaint_category import (
    ComplaintCategoryCreate,
    ComplaintCategoryResponse,
)
from app.services.complaint_category_service import (
    create_category,
    get_all_categories,
    get_category_by_id,
)



router = APIRouter(
    prefix="/complaint-categories",
    tags=["Complaint Categories"]
)


@router.post(
    "",
    response_model=ComplaintCategoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_category(
    category_data: ComplaintCategoryCreate,
    db: Session = Depends(get_db)
):
    return create_category(
        db=db,
        category_data=category_data
    )

@router.get(
    "",
    response_model=list[ComplaintCategoryResponse]
)
def get_categories(
    db: Session = Depends(get_db)
):
    return get_all_categories(db)


@router.get(
    "/{category_id}",
    response_model=ComplaintCategoryResponse
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = get_category_by_id(
        db=db,
        category_id=category_id
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint category not found"
        )

    return category