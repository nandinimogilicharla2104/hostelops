from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class TechnicianSkill(Base):
    __tablename__ = "technician_skills"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    technician_id: Mapped[int] = mapped_column(
        ForeignKey("technicians.id"),
        nullable=False
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("complaint_categories.id"),
        nullable=False
    )

    skill_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )