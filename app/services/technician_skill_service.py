from sqlalchemy.orm import Session

from app.models.technician_skill import TechnicianSkill
from app.schemas.technician_skill import TechnicianSkillCreate

from app.models.technician import Technician
from app.models.complaint_category import ComplaintCategory
from app.models.technician import Technician



def create_technician_skill(
    db: Session,
    skill_data: TechnicianSkillCreate
) -> TechnicianSkill:

    technician = db.query(Technician).filter(
        Technician.id == skill_data.technician_id
    ).first()

    if technician is None:
        raise ValueError("Technician not found")

    category = db.query(ComplaintCategory).filter(
    ComplaintCategory.id == skill_data.category_id
    ).first()

    if category is None:
        raise ValueError("Complaint category not found")

    existing_skill = db.query(TechnicianSkill).filter(
        TechnicianSkill.technician_id == skill_data.technician_id,
        TechnicianSkill.category_id == skill_data.category_id
    ).first()

    if existing_skill is not None:
        raise ValueError("Technician already has this skill")

    skill = TechnicianSkill(
        technician_id=skill_data.technician_id,
        category_id=skill_data.category_id,
        skill_level=skill_data.skill_level
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill

def get_all_technician_skills(
    db: Session
) -> list[TechnicianSkill]:

    return db.query(TechnicianSkill).all()

def get_skills_by_technician(
    db: Session,
    technician_id: int
) -> list[TechnicianSkill]:

    return db.query(TechnicianSkill).filter(
        TechnicianSkill.technician_id == technician_id
    ).all()


def get_skills_by_category(
    db: Session,
    category_id: int
) -> list[TechnicianSkill]:

    return db.query(TechnicianSkill).filter(
        TechnicianSkill.category_id == category_id
    ).all()


def get_qualified_technicians(
    db: Session,
    category_id: int,
    hostel_id: int | None = None
) -> list[Technician]:

    query = (
        db.query(Technician)
        .join(
            TechnicianSkill,
            Technician.id == TechnicianSkill.technician_id
        )
        .filter(
            TechnicianSkill.category_id == category_id,
            Technician.availability_status == "AVAILABLE"
        )
    )

    if hostel_id is not None:
        query = query.order_by(
            (Technician.hostel_id != hostel_id).asc(),
            Technician.current_workload.asc()
        )
    else:
        query = query.order_by(
            Technician.current_workload.asc()
        )

    return query.all()

