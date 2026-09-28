"""create room assignments table

Revision ID: 3796994c06df
Revises: cb1cc218ef68
Create Date: 2026-09-24 07:22:35.253701

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3796994c06df'
down_revision: Union[str, Sequence[str], None] = 'cb1cc218ef68'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "room_assignments",

        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False
        ),

        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "room_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "assigned_at",
            sa.DateTime(),
            nullable=False
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"]
        ),

        sa.ForeignKeyConstraint(
            ["room_id"],
            ["rooms.id"]
        ),

        sa.PrimaryKeyConstraint("id")
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_table("room_assignments")