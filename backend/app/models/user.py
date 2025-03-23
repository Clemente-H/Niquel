from pydantic import BaseModel, EmailStr
from typing import Optional, List


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "regular"


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: int
    is_active: bool

    class Config:
        from_orm = True


class User(UserInDBBase):
    """
    User model as returned by the API, does not include the hashed password
    """
    pass


class UserInDB(UserInDBBase):
    """
    User model as stored in the database, includes the hashed password
    """
    hashed_password: str