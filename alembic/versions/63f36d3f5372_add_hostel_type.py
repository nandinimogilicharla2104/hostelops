"""add hostel type

Revision ID: 63f36d3f5372
Revises: 23366f37137e
Create Date: 2026-09-23 22:50:08.388692

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '63f36d3f5372'
down_revision: Union[str, Sequence[str], None] = '23366f37137e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    hostel_type = sa.Enum(
        'BOYS',
        'GIRLS',
        name='hosteltype'
    )

    hostel_type.create(op.get_bind(), checkfirst=True)

    op.add_column(
        'hostels',
        sa.Column(
            'type',
            hostel_type,
            nullable=True
        )
    )

    op.execute(
        "UPDATE hostels SET type = 'BOYS' WHERE type IS NULL"
    )

    op.alter_column(
        'hostels',
        'type',
        nullable=False
    )

def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('hostels', 'type')

    sa.Enum(
        'BOYS',
        'GIRLS',
        name='hosteltype'
    ).drop(op.get_bind(), checkfirst=True)