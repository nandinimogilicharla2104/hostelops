from enum import Enum

from sqlalchemy import Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class HostelType(str, Enum):
    BOYS = "BOYS"
    GIRLS = "GIRLS"


class Hostel(Base):
    __tablename__ = "hostels"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    type: Mapped[HostelType] = mapped_column(
        SQLEnum(HostelType),
        nullable=False
    )