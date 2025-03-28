from __future__ import annotations

import uuid
import datetime
from typing import Optional

from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GeoPointImage(Base):
    """Model for images associated with geographic points."""

    # Image metadata
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    path: Mapped[str] = mapped_column(String(512), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    content_type: Mapped[str] = mapped_column(String(255), nullable=False)

    # Upload information
    upload_date: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now
    )
    uploaded_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )

    # Association with GeoPoint
    geo_point_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("geo_point.id", ondelete="CASCADE"), nullable=False
    )
    geo_point: Mapped["GeoPoint"] = relationship("GeoPoint", back_populates="images")

    def __repr__(self) -> str:
        return f"<GeoPointImage {self.id} for GeoPoint {self.geo_point_id}>"
