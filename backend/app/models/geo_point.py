from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import field_validator

from app.models.base import BaseSchema, TimeStampModel, Paginated


# Shared properties
class GeoPointBase(BaseSchema):
    """Base schema for GeoPoint."""

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gravity_level: Optional[int] = None
    description: Optional[str] = None
    kilometer: Optional[float] = None
    section: Optional[str] = None
    period_id: Optional[UUID] = None


# Properties to receive via API on creation
class GeoPointCreate(GeoPointBase):
    """Schema for creating a new geo point."""

    latitude: float
    longitude: float
    period_id: UUID
    gravity_level: int = 1

    @field_validator("gravity_level")
    def validate_gravity_level(cls, v):
        """Validate gravity level is between 1 and 3."""
        if v not in [1, 2, 3]:
            raise ValueError("Gravity level must be 1 (green), 2 (yellow), or 3 (red)")
        return v


# Properties to receive via API on update
class GeoPointUpdate(GeoPointBase):
    """Schema for updating a geo point."""

    @field_validator("gravity_level")
    def validate_gravity_level(cls, v):
        """Validate gravity level is between 1 and 3."""
        if v is not None and v not in [1, 2, 3]:
            raise ValueError("Gravity level must be 1 (green), 2 (yellow), or 3 (red)")
        return v


# Properties shared by models returned from API
class GeoPointInDBBase(GeoPointBase, TimeStampModel):
    """Base schema for DB GeoPoint with ID."""

    id: UUID
    created_by: Optional[UUID] = None


# Additional properties to return via API
class GeoPoint(GeoPointInDBBase):
    """Schema for GeoPoint responses."""

    pass


# Schema for multiple geo points with pagination
class PaginatedGeoPoints(Paginated[GeoPoint]):
    """Schema for paginated geo point responses."""

    items: List[GeoPoint]


# Schema for GeoPoint with associated images
class GeoPointWithImages(GeoPoint):
    """Schema for GeoPoint with images."""

    images: List["GeoPointImage"] = []


# Schema for GeoPointImage
class GeoPointImageBase(BaseSchema):
    """Base schema for GeoPointImage."""

    file_name: Optional[str] = None
    content_type: Optional[str] = None
    geo_point_id: Optional[UUID] = None


class GeoPointImageCreate(GeoPointImageBase):
    """Schema for creating a new geo point image."""

    file_name: str
    content_type: str
    geo_point_id: UUID


class GeoPointImageInDBBase(GeoPointImageBase, TimeStampModel):
    """Base schema for DB GeoPointImage with ID."""

    id: UUID
    path: str
    size: int
    upload_date: datetime
    uploaded_by: Optional[UUID] = None


class GeoPointImage(GeoPointImageInDBBase):
    """Schema for GeoPointImage responses."""

    pass


class PaginatedGeoPointImages(Paginated[GeoPointImage]):
    """Schema for paginated geo point image responses."""

    items: List[GeoPointImage]
