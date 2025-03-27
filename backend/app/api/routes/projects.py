from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession


from app.api.deps import CurrentUser, DbSession
from app.core.exceptions import NotFoundException
from app.db.models.project import Project
from app.db.models.period import Period
from app.db.models.file import File
from app.db.models.assignment import UserAssignment
from app.models.project import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
    PaginatedProjects,
    ProjectStats,
)
from app.db.models.user import User

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=PaginatedProjects)
async def get_projects(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 10,
    type: Optional[str] = None,
    status: Optional[str] = None,
):
    """
    Retrieve projects accessible by the current user.
    """
    # Base query to get projects
    query = select(Project)

    # Add filters
    if type:
        query = query.where(Project.type == type)

    if status:
        query = query.where(Project.status == status)

    # Access control: If not admin or manager, only show owned projects or assigned projects
    if current_user.role not in ["admin", "manager"]:
        # Get projects where user is owner or has an assignment
        query = query.where(
            (Project.owner_id == current_user.id)
            | (  # noqa: W503
                Project.id.in_(
                    select(UserAssignment.project_id).where(
                        UserAssignment.user_id == current_user.id
                    )
                )
            )
        )
    # Get total count for pagination
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total = result.scalar_one()

    # Get paginated results
    query = query.order_by(Project.name).offset(skip).limit(limit)
    result = await db.execute(query)
    projects = result.scalars().all()

    return {
        "items": projects,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "page_size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1,
    }


@router.post("", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Create a new project. The current user becomes the owner.
    """
    # Create new project
    project = Project(
        name=project_data.name,
        description=project_data.description,
        location=project_data.location,
        type=project_data.type,
        status=project_data.status or "Planificación",
        start_date=project_data.start_date,
        owner_id=current_user.id,
    )

    db.add(project)
    await db.commit()
    await db.refresh(project)

    return project


@router.get("/{project_id}", response_model=ProjectStats)
async def get_project(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Get a specific project by ID.
    """
    # Check if user has access to this project
    has_access = await check_project_access(db, project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this project",
        )

    # Get project with counts
    result = await db.execute(
        select(
            Project,
            func.count(distinct(Period.id)).label("period_count"),
            func.count(distinct(File.id)).label("file_count"),
            func.count(distinct(UserAssignment.id)).label("assigned_users_count"),
        )
        .outerjoin(Period, Period.project_id == Project.id)
        .outerjoin(File, File.project_id == Project.id)
        .outerjoin(UserAssignment, UserAssignment.project_id == Project.id)
        .where(Project.id == project_id)
        .group_by(Project.id)
    )

    row = result.first()
    if not row:
        raise NotFoundException("Project not found")

    project, period_count, file_count, assigned_users_count = row

    # Create response with stats
    return {
        **project.__dict__,
        "period_count": period_count,
        "file_count": file_count,
        "assigned_users_count": assigned_users_count,
    }


@router.put("/{project_id}", response_model=ProjectSchema)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Update a project.
    """
    # Check if user has edit access to this project
    has_access = await check_project_edit_access(db, project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to edit this project",
        )

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()

    if not project:
        raise NotFoundException("Project not found")

    # Update project fields
    for key, value in project_data.dict(exclude_unset=True).items():
        setattr(project, key, value)

    await db.commit()
    await db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Delete a project.
    Only project owners, admins, or users with admin role assignment can delete projects.
    """
    # Check if user has admin access to this project
    is_owner_or_admin = await check_project_admin_access(db, project_id, current_user)
    if not is_owner_or_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this project",
        )

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()

    if not project:
        raise NotFoundException("Project not found")

    await db.delete(project)
    await db.commit()


# Helper functions to check project access
async def check_project_access(db: AsyncSession, project_id: UUID, user: User) -> bool:
    """Check if user has at least viewer access to the project."""
    # Admins have access to all projects
    if user.role == "admin":
        return True

    # Check if user is owner
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    is_owner = result.scalars().first() is not None
    if is_owner:
        return True

    # Check if user has assignment
    result = await db.execute(
        select(UserAssignment).where(
            UserAssignment.project_id == project_id,
            UserAssignment.user_id == user.id,
        )
    )
    has_assignment = result.scalars().first() is not None

    return has_assignment


async def check_project_edit_access(
    db: AsyncSession, project_id: UUID, user: User
) -> bool:
    """Check if user has edit access to the project."""
    # Admins have edit access to all projects
    if user.role == "admin":
        return True

    # Check if user is owner
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    is_owner = result.scalars().first() is not None
    if is_owner:
        return True

    # Check if user has editor or admin assignment
    result = await db.execute(
        select(UserAssignment).where(
            UserAssignment.project_id == project_id,
            UserAssignment.user_id == user.id,
            UserAssignment.role.in_(["editor", "admin"]),
        )
    )
    has_edit_role = result.scalars().first() is not None

    return has_edit_role


async def check_project_admin_access(
    db: AsyncSession, project_id: UUID, user: User
) -> bool:
    """Check if user has admin access to the project."""
    # Admins have admin access to all projects
    if user.role == "admin":
        return True

    # Check if user is owner
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    is_owner = result.scalars().first() is not None
    if is_owner:
        return True

    # Check if user has admin assignment
    result = await db.execute(
        select(UserAssignment).where(
            UserAssignment.project_id == project_id,
            UserAssignment.user_id == user.id,
            UserAssignment.role == "admin",
        )
    )
    has_admin_role = result.scalars().first() is not None

    return has_admin_role
