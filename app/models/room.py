from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    room_number: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    block_id: Mapped[int] = mapped_column(
        ForeignKey("blocks.id"),
        nullable=False
    )