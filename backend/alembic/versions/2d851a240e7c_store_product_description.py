"""store product descriptions for compatibility matching

Revision ID: 2d851a240e7c
Revises: 5a0bd7512da2
Create Date: 2026-11-09
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2d851a240e7c"
down_revision: Union[str, Sequence[str], None] = "5a0bd7512da2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("description", sa.Text(), nullable=True))
    op.execute(
        sa.text(
            """
            UPDATE products
            SET description = (
                SELECT raw_pages.raw_json ->> 'body_html'
                FROM raw_pages
                WHERE raw_pages.handle = products.handle
                LIMIT 1
            )
            WHERE products.handle IS NOT NULL
            """
        )
    )


def downgrade() -> None:
    op.drop_column("products", "description")
