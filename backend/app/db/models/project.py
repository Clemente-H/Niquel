from __future__ import annotations

import uuid
import datetime
from typing import List

from sqlalchemy import String, ForeignKey, Date, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Project(Base):
    """Project model for water resource management projects."""

    # Basic project information
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)

    # Project classification
    type: Mapped[str] = mapped_column(
        Enum(
            "Hidrología",
            "Conservación",
            "Monitoreo",
            "Análisis",
            "Restauración",
            name="project_type",
        ),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum(
            "Planificación",
            "En progreso",
            "En revisión",
            "Completado",
            name="project_status",
        ),
        default="Planificación",
        nullable=False,
    )

    # Project timing
    start_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)

    # Ownership
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    owner: Mapped["User"] = relationship(
        "User", back_populates="owned_projects", foreign_keys=[owner_id]
    )

    # Relationships
    periods: Mapped[List["Period"]] = relationship(
        "Period",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    files: Mapped[List["File"]] = relationship(
        "File",
        back_populates="project",
        cascade="all, delete-orphan",
        primaryjoin="Project.id == File.project_id",
    )

    user_assignments: Mapped[List["UserAssignment"]] = relationship(
        "UserAssignment",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Project {self.name} ({self.type})>"
