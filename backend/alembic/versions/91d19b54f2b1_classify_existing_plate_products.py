"""classify existing PCB and plate listings

Revision ID: 91d19b54f2b1
Revises: 2d851a240e7c
Create Date: 2026-11-09
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "91d19b54f2b1"
down_revision: Union[str, Sequence[str], None] = "2d851a240e7c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE products
            SET type = 'pcb_plate'
            WHERE product_type_raw ILIKE '%plate%'
               OR product_type_raw ILIKE '%pcb%'
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE products
            SET type = 'other'
            WHERE type = 'pcb_plate'
              AND (product_type_raw ILIKE '%plate%' OR product_type_raw ILIKE '%pcb%')
            """
        )
    )
