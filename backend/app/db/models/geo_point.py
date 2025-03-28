from __future__ import annotations

import uuid
from typing import List, Optional

from sqlalchemy import String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GeoPoint(Base):
    """Model for geographic points on maps with severity indicators."""

    # Basic geographic information
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Level of severity/gravity (1-green, 2-yellow, 3-red)
    gravity_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Additional metadata
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    kilometer: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    section: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    period_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("period.id", ondelete="CASCADE"), nullable=False
    )
    period: Mapped["Period"] = relationship("Period", back_populates="geo_points")

    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )

    # Maintain reference to associated images
    images: Mapped[List["GeoPointImage"]] = relationship(
        "GeoPointImage", back_populates="geo_point", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<GeoPoint {self.id} at ({self.latitude}, {self.longitude}), Level: {self.gravity_level}>"  # noqa: E501
