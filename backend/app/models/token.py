from typing import Optional
from pydantic import EmailStr

from app.models.base import BaseSchema


class TokenCreate(BaseSchema):
    """Schema for creating a token (login)."""

    email: EmailStr
    password: str


class Token(BaseSchema):
    """Schema for token response."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseSchema):
    """Schema for token payload data."""

    sub: Optional[str] = None  # User ID
    exp: Optional[int] = None  # Expiration time
