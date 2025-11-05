"""add fees to program

Revision ID: add_fees_to_program
Revises: 5ee8f4adae88
Create Date: 2025-11-05 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_fees_to_program'
down_revision = '5ee8f4adae88'
branch_labels = None
depends_on = None


def upgrade():
    # Add fees column to program table
    op.add_column('program', sa.Column('fees', sa.String(50), nullable=True))


def downgrade():
    # Drop fees column from program table
    op.drop_column('program', 'fees')