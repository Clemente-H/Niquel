from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "pending"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    status: Optional[str] = None


class ProjectInDBBase(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_orm = True


class Project(ProjectInDBBase):
    """
    Project model as returned by the API
    """
    pass


class ProjectWithUsers(Project):
    assigned_users: List[Any] = []  # List[User] is not used to avoid circular dependency