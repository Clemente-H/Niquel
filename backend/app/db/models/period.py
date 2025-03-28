from __future__ import annotations

import uuid
import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import String, ForeignKey, Date, Text, Float, Time, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

# Only import File when type checking to avoid circular import
if TYPE_CHECKING:
    from app.db.models.file import File
    from app.db.models.geo_point import GeoPoint


class Period(Base):
    """Period model for tracking specific time periods in projects."""

    # Basic period information
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    end_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)

    # Water-related metrics (optional)
    volume: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    start_time: Mapped[Optional[datetime.time]] = mapped_column(Time, nullable=True)
    width: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_depth: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Notes and comments
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=False
    )
    project: Mapped["Project"] = relationship("Project", back_populates="periods")

    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    created_by_user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="created_periods", foreign_keys=[created_by]
    )

    # Change to a viewonly relationship to prevent circular dependency issues
    files: Mapped[List["File"]] = relationship(
        "File",
        primaryjoin="Period.id == File.period_id",
        foreign_keys="[File.period_id]",
        back_populates="period",
        cascade="all, delete-orphan",
    )

    # Reference to the main KML file
    kml_file_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, nullable=True)

    # This is where we fix the circular dependency
    # Make the relationship viewonly and use string references
    kml_file: Mapped[Optional["File"]] = relationship(
        "File",
        primaryjoin="File.id == Period.kml_file_id",
        foreign_keys=[kml_file_id],
        uselist=False,
        viewonly=True,  # Mark as read-only
    )

    # Geo points associated with this period
    geo_points: Mapped[List["GeoPoint"]] = relationship(
        "GeoPoint", back_populates="period", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Period {self.name} ({self.start_date} to {self.end_date})>"
