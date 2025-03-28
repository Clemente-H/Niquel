from __future__ import annotations

import uuid
import datetime
from typing import Optional

from sqlalchemy import String, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class File(Base):
    """File model for storing uploaded files related to projects and periods."""

    # File metadata
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    path: Mapped[str] = mapped_column(String(512), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    content_type: Mapped[str] = mapped_column(String(255), nullable=False)

    # File categorization
    category: Mapped[str] = mapped_column(
        Enum("map", "image", "document", "analysis", name="file_category"),
        nullable=False,
    )

    # Upload information
    upload_date: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=True
    )
    period_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("period.id", ondelete="SET NULL"), nullable=True
    )

    project: Mapped[Optional["Project"]] = relationship(
        "Project", back_populates="files"
    )
    period: Mapped[Optional["Period"]] = relationship(
        "Period",
        primaryjoin="File.period_id == Period.id",
        foreign_keys="[File.period_id]",
        back_populates="files",
    )
    uploader: Mapped[Optional["User"]] = relationship(
        "User", back_populates="uploaded_files", foreign_keys=[uploaded_by]
    )

    def __repr__(self) -> str:
        return f"<File {self.name} ({self.category})>"
