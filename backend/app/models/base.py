from datetime import datetime
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel


class BaseSchema(BaseModel):
    """Base schema with common configuration for all models."""

    class Config:
        """Pydantic configuration."""

        from_attributes = True  # For SQLAlchemy models compatibility
        populate_by_name = True


class TimeStampModel(BaseSchema):
    """Schema with timestamp fields for models that include created_at and updated_at."""

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Generic data type for pagination
T = TypeVar("T")


class Paginated(BaseSchema, Generic[T]):
    """Paginated response with items and metadata."""

    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int
