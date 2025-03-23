from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base

# Table for association between many users and many projects
user_project = Table(
    "user_project",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="regular")  # "admin", "manager", "regular"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    projects = relationship(
        "Project", secondary=user_project, back_populates="assigned_users"
    )
    files = relationship("File", back_populates="uploaded_by")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    status = Column(
        String, default="pending"
    )  # "pending", "in_progress", "completed", "cancelled"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    assigned_users = relationship(
        "User", secondary=user_project, back_populates="projects"
    )
    files = relationship("File", back_populates="project")
    history = relationship("ProjectHistory", back_populates="project")


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    filepath = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)  # size in bytes
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("Project", back_populates="files")

    uploaded_by_id = Column(Integer, ForeignKey("users.id"))
    uploaded_by = relationship("User", back_populates="files")


class ProjectHistory(Base):
    __tablename__ = "project_history"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)  # "created", "updated", "status_changed", etc.
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("Project", back_populates="history")

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User")
