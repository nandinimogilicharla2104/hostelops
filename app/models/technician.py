from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Technician(Base):
    __tablename__ = "technicians"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    employee_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    availability_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="AVAILABLE"
    )

    current_workload: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    hostel_id: Mapped[int] = mapped_column(
        ForeignKey("hostels.id"),
        nullable=False
    )