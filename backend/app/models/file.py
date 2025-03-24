from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import validator

from app.models.base import BaseSchema, TimeStampModel, Paginated


# Shared properties
class FileBase(BaseSchema):
    """Base schema for File."""

    name: Optional[str] = None
    content_type: Optional[str] = None
    category: Optional[str] = None
    project_id: Optional[UUID] = None
    period_id: Optional[UUID] = None


# Properties to receive via API on file upload
class FileUpload(FileBase):
    """Schema for file upload metadata."""

    name: str
    category: str

    @validator("category")
    def validate_category(cls, v):
        """Validate that category is one of the allowed values."""
        allowed_categories = ["map", "image", "document", "analysis"]
        if v not in allowed_categories:
            raise ValueError(f"Category must be one of {allowed_categories}")
        return v


# Properties to return after file upload
class FileCreate(FileBase):
    """Schema for created file information."""

    name: str
    category: str
    size: int
    content_type: str
    project_id: Optional[UUID] = None
    period_id: Optional[UUID] = None


# Properties shared by models returned from API
class FileInDBBase(FileBase, TimeStampModel):
    """Base schema for DB File with ID."""

    id: UUID
    path: str
    size: int
    upload_date: datetime
    uploaded_by: Optional[UUID] = None


# Additional properties to return via API
class File(FileInDBBase):
    """Schema for File responses."""

    pass


# Schema for multiple files with pagination
class PaginatedFiles(Paginated[File]):
    """Schema for paginated file responses."""

    items: List[File]


# Schema for file update
class FileUpdate(FileBase):
    """Schema for updating file metadata."""

    name: Optional[str] = None
    category: Optional[str] = None

    @validator("category")
    def validate_category(cls, v):
        """Validate that category is one of the allowed values."""
        if v is None:
            return v
        allowed_categories = ["map", "image", "document", "analysis"]
        if v not in allowed_categories:
            raise ValueError(f"Category must be one of {allowed_categories}")
        return v
