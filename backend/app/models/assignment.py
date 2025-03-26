from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import field_validator

from app.models.base import BaseSchema, TimeStampModel, Paginated
from app.models.user import User


# Shared properties
class UserAssignmentBase(BaseSchema):
    """Base schema for UserAssignment."""

    user_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    role: Optional[str] = None


# Properties to receive via API on creation
class UserAssignmentCreate(UserAssignmentBase):
    """Schema for creating a new user assignment."""

    user_id: UUID
    project_id: UUID
    role: str = "viewer"  # Default role is viewer

    @field_validator("role")
    def validate_role(cls, v):
        """Validate that role is one of the allowed values."""
        allowed_roles = ["viewer", "editor", "admin"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v


# Properties to receive via API on update
class UserAssignmentUpdate(UserAssignmentBase):
    """Schema for updating a user assignment."""

    role: Optional[str] = None

    @field_validator("role")
    def validate_role(cls, v):
        """Validate that role is one of the allowed values."""
        if v is None:
            return v
        allowed_roles = ["viewer", "editor", "admin"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v


# Properties shared by models returned from API
class UserAssignmentInDBBase(UserAssignmentBase, TimeStampModel):
    """Base schema for DB UserAssignment with ID."""

    id: UUID
    assigned_at: datetime
    assigned_by: Optional[UUID] = None


# Additional properties to return via API
class UserAssignment(UserAssignmentInDBBase):
    """Schema for UserAssignment responses."""

    pass


# Schema for multiple user assignments with pagination
class PaginatedUserAssignments(Paginated[UserAssignment]):
    """Schema for paginated user assignment responses."""

    items: List[UserAssignment]


# Schema for user assignment with additional user information
class UserAssignmentWithUser(UserAssignment):
    """Schema for UserAssignment with User information."""

    user: User


# Schema for batch assignment
class BatchAssignment(BaseSchema):
    """Schema for batch assignment of users to a project."""

    project_id: UUID
    user_ids: List[UUID]
    role: str = "viewer"

    @field_validator("role")
    def validate_role(cls, v):
        """Validate that role is one of the allowed values."""
        allowed_roles = ["viewer", "editor", "admin"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v
