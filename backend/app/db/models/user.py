from __future__ import annotations

from typing import List

from sqlalchemy import String, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    """User model for authentication and role-based access control."""

    # User authentication fields
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # User profile fields
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum("admin", "manager", "regular", name="user_role"),
        default="regular",
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    owned_projects: Mapped[List["Project"]] = relationship(
        "Project",
        back_populates="owner",
        cascade="all, delete-orphan",
        foreign_keys="[Project.owner_id]",
    )

    created_periods: Mapped[List["Period"]] = relationship(
        "Period",
        back_populates="created_by_user",
        foreign_keys="[Period.created_by]",
    )

    uploaded_files: Mapped[List["File"]] = relationship(
        "File",
        back_populates="uploader",
        foreign_keys="[File.uploaded_by]",
    )

    assignments: Mapped[List["UserAssignment"]] = relationship(
        "UserAssignment",
        back_populates="user",
        foreign_keys="[UserAssignment.user_id]",
        cascade="all, delete-orphan",
    )

    assigned_users: Mapped[List["UserAssignment"]] = relationship(
        "UserAssignment",
        back_populates="assigned_by_user",
        foreign_keys="[UserAssignment.assigned_by]",
    )

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
