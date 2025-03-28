from datetime import date, time
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID

from app.models.base import BaseSchema, TimeStampModel

if TYPE_CHECKING:
    from app.models.geo_point import GeoPoint


# Shared properties
class PeriodBase(BaseSchema):
    """Base schema for Period."""

    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    volume: Optional[float] = None
    start_time: Optional[time] = None
    width: Optional[float] = None
    max_depth: Optional[float] = None
    notes: Optional[str] = None
    kml_file_id: Optional[UUID] = None


# Properties to receive via API on creation
class PeriodCreate(PeriodBase):
    """Schema for creating a new period."""

    name: str
    start_date: date
    end_date: date
    project_id: UUID


# Properties to receive via API on update
class PeriodUpdate(PeriodBase):
    """Schema for updating a period."""

    pass


# Properties shared by models returned from API
class PeriodInDBBase(PeriodBase, TimeStampModel):
    """Base schema for DB Period with ID."""

    id: UUID
    project_id: UUID
    created_by: Optional[UUID] = None


# Additional properties to return via API
class Period(PeriodInDBBase):
    """Schema for Period responses."""

    geo_points: List["GeoPoint"] = []


# Schema for multiple periods with pagination
class PaginatedPeriods(BaseSchema):
    """Schema for paginated period responses."""

    items: List[Period]
    total: int
    page: int
    page_size: int
    pages: int


# Schema for period with additional information
class PeriodWithDetails(Period):
    """Schema for Period with additional details."""

    file_count: int
