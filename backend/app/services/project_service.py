from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.exceptions import NotFoundException
from app.db.models.project import Project
from app.db.models.period import Period
from app.db.models.file import File
from app.db.models.assignment import UserAssignment
from app.models.project import ProjectCreate, ProjectUpdate


async def get_project_by_id(db: AsyncSession, project_id: UUID) -> Optional[Project]:
    """
    Get a project by ID.

    Args:
        db: Database session
        project_id: Project ID

    Returns:
        Optional[Project]: Project if found, None otherwise
    """
    result = await db.execute(
        select(Project)
        .options(joinedload(Project.owner))
        .where(Project.id == project_id)
    )
    return result.scalars().first()


async def get_projects(
    db: AsyncSession,
    user_id: Optional[UUID] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    include_owner: bool = False,
) -> List[Project]:
    """
    Get projects with optional filtering.

    Args:
        db: Database session
        user_id: Optional user ID to get only projects accessible by this user
        type: Optional project type filter
        status: Optional project status filter
        skip: Number of records to skip
        limit: Maximum number of records to return
        include_owner: Whether to include owner information

    Returns:
        List[Project]: List of projects
    """
    query = select(Project)

    # Apply filters
    if type:
        query = query.where(Project.type == type)

    if status:
        query = query.where(Project.status == status)

    if user_id:
        # Get projects where user is owner or has an assignment
        query = query.where(
            (Project.owner_id == user_id)
            | (  # noqa: W503
                Project.id.in_(
                    select(UserAssignment.project_id).where(
                        UserAssignment.user_id == user_id
                    )
                )
            )
        )

    if include_owner:
        query = query.options(joinedload(Project.owner))

    query = query.order_by(Project.name).offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all()


async def get_projects_count(
    db: AsyncSession,
    user_id: Optional[UUID] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
) -> int:
    """
    Get count of projects with optional filtering.

    Args:
        db: Database session
        user_id: Optional user ID to get only projects accessible by this user
        type: Optional project type filter
        status: Optional project status filter

    Returns:
        int: Count of projects
    """
    query = select(func.count(Project.id))

    # Apply filters
    if type:
        query = query.where(Project.type == type)

    if status:
        query = query.where(Project.status == status)

    if user_id:
        # Get projects where user is owner or has an assignment
        query = query.where(
            (Project.owner_id == user_id)
            | (  # noqa: W503
                Project.id.in_(
                    select(UserAssignment.project_id).where(
                        UserAssignment.user_id == user_id
                    )
                )
            )
        )

    result = await db.execute(query)
    return result.scalar_one()


async def create_project(
    db: AsyncSession, project_data: ProjectCreate, owner_id: UUID
) -> Project:
    """
    Create a new project.

    Args:
        db: Database session
        project_data: Project data
        owner_id: Owner user ID

    Returns:
        Project: Created project
    """
    # Create new project
    project = Project(
        name=project_data.name,
        description=project_data.description,
        location=project_data.location,
        type=project_data.type,
        status=project_data.status or "Planificación",
        start_date=project_data.start_date,
        owner_id=owner_id,
    )

    db.add(project)
    await db.commit()
    await db.refresh(project)

    return project


async def update_project(
    db: AsyncSession, project_id: UUID, project_data: ProjectUpdate
) -> Project:
    """
    Update a project.

    Args:
        db: Database session
        project_id: Project ID
        project_data: Updated project data

    Returns:
        Project: Updated project

    Raises:
        NotFoundException: If project not found
    """
    project = await get_project_by_id(db, project_id)
    if not project:
        raise NotFoundException("Project not found")

    # Update fields
    update_data = project_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)

    return project


async def delete_project(db: AsyncSession, project_id: UUID) -> bool:
    """
    Delete a project.

    Args:
        db: Database session
        project_id: Project ID

    Returns:
        bool: True if project was deleted, False otherwise

    Raises:
        NotFoundException: If project not found
    """
    project = await get_project_by_id(db, project_id)
    if not project:
        raise NotFoundException("Project not found")

    await db.delete(project)
    await db.commit()

    return True


async def get_project_stats(db: AsyncSession, project_id: UUID) -> Dict[str, Any]:
    """
    Get statistics for a project.

    Args:
        db: Database session
        project_id: Project ID

    Returns:
        Dict[str, Any]: Project statistics

    Raises:
        NotFoundException: If project not found
    """
    project = await get_project_by_id(db, project_id)
    if not project:
        raise NotFoundException("Project not found")

    # Get period count
    period_count_result = await db.execute(
        select(func.count(Period.id)).where(Period.project_id == project_id)
    )
    period_count = period_count_result.scalar_one()

    # Get file count
    file_count_result = await db.execute(
        select(func.count(File.id)).where(File.project_id == project_id)
    )
    file_count = file_count_result.scalar_one()

    # Get assigned users count
    user_count_result = await db.execute(
        select(func.count(UserAssignment.id)).where(
            UserAssignment.project_id == project_id
        )
    )
    assigned_users_count = user_count_result.scalar_one()

    return {
        **project.__dict__,
        "period_count": period_count,
        "file_count": file_count,
        "assigned_users_count": assigned_users_count,
    }


async def check_project_access(
    db: AsyncSession, project_id: UUID, user_id: UUID, is_admin: bool = False
) -> bool:
    """
    Check if a user has access to a project.

    Args:
        db: Database session
        project_id: Project ID
        user_id: User ID
        is_admin: Whether the user is a global admin

    Returns:
        bool: True if user has access, False otherwise
    """
    # Global admins have access to all projects
    if is_admin:
        return True

    # Check if user is owner
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    is_owner = result.scalars().first() is not None
    if is_owner:
        return True

    # Check if user has assignment
    result = await db.execute(
        select(UserAssignment).where(
            UserAssignment.project_id == project_id,
            UserAssignment.user_id == user_id,
        )
    )
    has_assignment = result.scalars().first() is not None

    return has_assignment


async def check_project_edit_access(
    db: AsyncSession, project_id: UUID, user_id: UUID, is_admin: bool = False
) -> bool:
    """
    Check if a user has edit access to a project.

    Args:
        db: Database session
        project_id: Project ID
        user_id: User ID
        is_admin: Whether the user is a global admin

    Returns:
        bool: True if user has edit access, False otherwise
    """
    # Global admins have edit access to all projects
    if is_admin:
        return True

    # Check if user is owner
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    is_owner = result.scalars().first() is not None
    if is_owner:
        return True

    # Check if user has editor or admin assignment
    result = await db.execute(
        select(UserAssignment).where(
            UserAssignment.project_id == project_id,
            UserAssignment.user_id == user_id,
            UserAssignment.role.in_(["editor", "admin"]),
        )
    )
    has_edit_role = result.scalars().first() is not None

    return has_edit_role


async def check_project_admin_access(
    db: AsyncSession, project_id: UUID, user_id: UUID, is_admin: bool = False
) -> bool:
    """
    Check if a user has admin access to a project.

    Args:
        db: Database session
        project_id: Project ID
        user_id: User ID
        is_admin: Whether the user is a global admin

    Returns:
        bool: True if user has admin access, False otherwise
    """
    # Global admins have admin access to all projects
    if is_admin:
        return True

    # Check if user is owner
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    is_owner = result.scalars().first() is not None
    if is_owner:
        return True

    # Check if user has admin assignment
    result = await db.execute(
        select(UserAssignment).where(
            UserAssignment.project_id == project_id,
            UserAssignment.user_id == user_id,
            UserAssignment.role == "admin",
        )
    )
    has_admin_role = result.scalars().first() is not None

    return has_admin_role
