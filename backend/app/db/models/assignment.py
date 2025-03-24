from __future__ import annotations

import uuid
import datetime
from typing import Optional

from sqlalchemy import ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserAssignment(Base):
    """Model for tracking user assignments to projects with different roles."""

    # Assignment relationships
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=False
    )

    # Assignment role
    role: Mapped[str] = mapped_column(
        Enum("viewer", "editor", "admin", name="assignment_role"),
        default="viewer",
        nullable=False,
    )

    # Assignment metadata
    assigned_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now
    )
    assigned_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User", back_populates="assignments", foreign_keys=[user_id]
    )
    project: Mapped["Project"] = relationship(
        "Project", back_populates="user_assignments"
    )
    assigned_by_user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="assigned_users", foreign_keys=[assigned_by]
    )

    def __repr__(self) -> str:
        return f"<UserAssignment User:{self.user_id} to Project:{self.project_id} as {self.role}>"
