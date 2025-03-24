from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column
from sqlalchemy import DateTime
import datetime
import uuid


class Base(DeclarativeBase):
    """Base class for all models."""

    @declared_attr.directive
    def __tablename__(cls) -> str:
        """
        Generate __tablename__ automatically from the class name.
        Converts CamelCase to snake_case.
        """
        # Convert CamelCase to snake_case
        name = cls.__name__
        return "".join(["_" + c.lower() if c.isupper() else c for c in name]).lstrip(
            "_"
        )

    # Common columns for all models
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now
    )
