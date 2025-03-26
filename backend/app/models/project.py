from datetime import date
from typing import List, Optional
from uuid import UUID
from pydantic import field_validator

from app.models.base import BaseSchema, TimeStampModel, Paginated


# Shared properties
class ProjectBase(BaseSchema):
    """Base schema for Project."""

    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None


# Properties to receive via API on creation
class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""

    name: str
    type: str
    start_date: date

    @field_validator("type")
    def validate_type(cls, v):
        """Validate that type is one of the allowed values."""
        allowed_types = [
            "Hidrología",
            "Conservación",
            "Monitoreo",
            "Análisis",
            "Restauración",
        ]
        if v not in allowed_types:
            raise ValueError(f"Type must be one of {allowed_types}")
        return v

    @field_validator("status", mode="before")
    def set_default_status(cls, v):
        """Set default status if not provided."""
        return v or "Planificación"


# Properties to receive via API on update
class ProjectUpdate(ProjectBase):
    """Schema for updating a project."""

    @field_validator("status")
    def validate_status(cls, v):
        """Validate that status is one of the allowed values."""
        if v is None:
            return v
        allowed_statuses = ["Planificación", "En progreso", "En revisión", "Completado"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of {allowed_statuses}")
        return v

    @field_validator("type")
    def validate_type(cls, v):
        """Validate that type is one of the allowed values."""
        if v is None:
            return v
        allowed_types = [
            "Hidrología",
            "Conservación",
            "Monitoreo",
            "Análisis",
            "Restauración",
        ]
        if v not in allowed_types:
            raise ValueError(f"Type must be one of {allowed_types}")
        return v


# Properties shared by models returned from API
class ProjectInDBBase(ProjectBase, TimeStampModel):
    """Base schema for DB Project with ID."""

    id: UUID
    owner_id: UUID


# Additional properties to return via API
class Project(ProjectInDBBase):
    """Schema for Project responses."""

    pass


# Schema for multiple projects with pagination
class PaginatedProjects(Paginated[Project]):
    """Schema for paginated project responses."""

    items: List[Project]


# Schema for project with statistics
class ProjectStats(Project):
    """Schema for Project with statistics."""

    period_count: int
    file_count: int
    assigned_users_count: int
