from typing import List, Optional
from uuid import UUID
from pydantic import EmailStr, validator

from app.models.base import BaseSchema, TimeStampModel, Paginated


# Shared properties
class UserBase(BaseSchema):
    """Base schema for User."""

    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = True


# Properties to receive via API on creation
class UserCreate(UserBase):
    """Schema for creating a new user."""

    email: EmailStr
    name: str
    password: str
    role: str = "regular"  # Default role is regular

    @validator("role")
    def validate_role(cls, v):
        """Validate that role is one of the allowed values."""
        allowed_roles = ["admin", "manager", "regular"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v


# Properties to receive via API on update
class UserUpdate(UserBase):
    """Schema for updating a user."""

    password: Optional[str] = None


# Properties shared by models returned from API
class UserInDBBase(UserBase, TimeStampModel):
    """Base schema for DB User with ID."""

    id: UUID

    class Config:
        orm_mode = True


# Additional properties to return via API
class User(UserInDBBase):
    """Schema for User responses."""

    pass


# Additional properties stored in DB but not returned in responses
class UserInDB(UserInDBBase):
    """Schema for User with hashed password."""

    hashed_password: str


# Schema for multiple users with pagination
class PaginatedUsers(Paginated[User]):
    """Schema for paginated user responses."""

    items: List[User]


# Schema for requesting password reset
class PasswordReset(BaseSchema):
    """Schema for requesting password reset."""

    email: EmailStr


# Schema for resetting password with token
class PasswordResetWithToken(BaseSchema):
    """Schema for resetting password with token."""

    token: str
    new_password: str
