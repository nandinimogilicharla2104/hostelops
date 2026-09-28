from sqlalchemy.orm import Session

from app.models.complaint_category import ComplaintCategory
from app.schemas.complaint_category import ComplaintCategoryCreate


def create_category(
    db: Session,
    category_data: ComplaintCategoryCreate
) -> ComplaintCategory:

    category = ComplaintCategory(
        name=category_data.name,
        description=category_data.description
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category

def get_all_categories(
    db: Session
) -> list[ComplaintCategory]:

    return db.query(ComplaintCategory).filter(
        ComplaintCategory.is_active == True
    ).all()

def get_category_by_id(
    db: Session,
    category_id: int
) -> ComplaintCategory | None:

    return db.query(ComplaintCategory).filter(
        ComplaintCategory.id == category_id,
        ComplaintCategory.is_active == True
    ).first()
