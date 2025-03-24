from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.exceptions import NotFoundException, DuplicateResourceException
from app.db.models.assignment import UserAssignment
from app.db.models.user import User
from app.services.user_service import get_user_by_id
from app.services.project_service import get_project_by_id
from app.models.assignment import (
    UserAssignmentCreate,
    UserAssignmentUpdate,
    BatchAssignment,
)


async def get_assignment_by_id(
    db: AsyncSession, assignment_id: UUID
) -> Optional[UserAssignment]:
    """
    Get an assignment by ID.

    Args:
        db: Database session
        assignment_id: Assignment ID

    Returns:
        Optional[UserAssignment]: Assignment if found, None otherwise
    """
    result = await db.execute(
        select(UserAssignment).where(UserAssignment.id == assignment_id)
    )
    return result.scalars().first()


async def get_assignment(
    db: AsyncSession, project_id: UUID, user_id: UUID
) -> Optional[UserAssignment]:
    """
    Get an assignment by project and user IDs.

    Args:
        db: Database session
        project_id: Project ID
        user_id: User ID

    Returns:
        Optional[UserAssignment]: Assignment if found, None otherwise
    """
    result = await db.execute(
        select(UserAssignment).where(
            UserAssignment.project_id == project_id,
            UserAssignment.user_id == user_id,
        )
    )
    return result.scalars().first()


async def get_project_assignments(
    db: AsyncSession,
    project_id: UUID,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    include_user: bool = False,
) -> List[UserAssignment]:
    """
    Get assignments for a project.

    Args:
        db: Database session
        project_id: Project ID
        role: Optional role filter
        skip: Number of records to skip
        limit: Maximum number of records to return
        include_user: Whether to include user information

    Returns:
        List[UserAssignment]: List of assignments
    """
    query = select(UserAssignment).where(UserAssignment.project_id == project_id)

    if role:
        query = query.where(UserAssignment.role == role)

    if include_user:
        query = query.options(joinedload(UserAssignment.user))

    query = query.order_by(UserAssignment.assigned_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all()


async def get_user_assignments(
    db: AsyncSession,
    user_id: UUID,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[UserAssignment]:
    """
    Get assignments for a user.

    Args:
        db: Database session
        user_id: User ID
        role: Optional role filter
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[UserAssignment]: List of assignments
    """
    query = select(UserAssignment).where(UserAssignment.user_id == user_id)

    if role:
        query = query.where(UserAssignment.role == role)

    query = query.order_by(UserAssignment.assigned_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all()


async def get_assignments_count(
    db: AsyncSession,
    project_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    role: Optional[str] = None,
) -> int:
    """
    Get count of assignments with optional filtering.

    Args:
        db: Database session
        project_id: Optional project ID filter
        user_id: Optional user ID filter
        role: Optional role filter

    Returns:
        int: Count of assignments
    """
    query = select(func.count(UserAssignment.id))

    if project_id:
        query = query.where(UserAssignment.project_id == project_id)

    if user_id:
        query = query.where(UserAssignment.user_id == user_id)

    if role:
        query = query.where(UserAssignment.role == role)

    result = await db.execute(query)
    return result.scalar_one()


async def create_assignment(
    db: AsyncSession, assignment_data: UserAssignmentCreate, assigned_by: UUID
) -> UserAssignment:
    """
    Create a new user assignment.

    Args:
        db: Database session
        assignment_data: Assignment data
        assigned_by: User ID who created the assignment

    Returns:
        UserAssignment: Created assignment

    Raises:
        NotFoundException: If user or project not found
        DuplicateResourceException: If assignment already exists
    """
    # Check if user exists
    user = await get_user_by_id(db, assignment_data.user_id)
    if not user:
        raise NotFoundException("User not found")

    # Check if project exists
    project = await get_project_by_id(db, assignment_data.project_id)
    if not project:
        raise NotFoundException("Project not found")

    # Check if assignment already exists
    existing = await get_assignment(
        db, assignment_data.project_id, assignment_data.user_id
    )
    if existing:
        raise DuplicateResourceException("User is already assigned to this project")

    # Create new assignment
    assignment = UserAssignment(
        user_id=assignment_data.user_id,
        project_id=assignment_data.project_id,
        role=assignment_data.role,
        assigned_by=assigned_by,
    )

    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)

    return assignment


async def update_assignment(
    db: AsyncSession, assignment_id: UUID, assignment_data: UserAssignmentUpdate
) -> UserAssignment:
    """
    Update an assignment.

    Args:
        db: Database session
        assignment_id: Assignment ID
        assignment_data: Updated assignment data

    Returns:
        UserAssignment: Updated assignment

    Raises:
        NotFoundException: If assignment not found
    """
    assignment = await get_assignment_by_id(db, assignment_id)
    if not assignment:
        raise NotFoundException("Assignment not found")

    # Update fields
    update_data = assignment_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(assignment, field, value)

    await db.commit()
    await db.refresh(assignment)

    return assignment


async def delete_assignment(db: AsyncSession, assignment_id: UUID) -> bool:
    """
    Delete an assignment.

    Args:
        db: Database session
        assignment_id: Assignment ID

    Returns:
        bool: True if assignment was deleted, False otherwise

    Raises:
        NotFoundException: If assignment not found
    """
    assignment = await get_assignment_by_id(db, assignment_id)
    if not assignment:
        raise NotFoundException("Assignment not found")

    await db.delete(assignment)
    await db.commit()

    return True


async def batch_assign_users(
    db: AsyncSession, batch_data: BatchAssignment, assigned_by: UUID
) -> List[UserAssignment]:
    """
    Assign multiple users to a project.

    Args:
        db: Database session
        batch_data: Batch assignment data
        assigned_by: User ID who created the assignments

    Returns:
        List[UserAssignment]: List of created assignments

    Raises:
        NotFoundException: If project not found
    """
    # Check if project exists
    project = await get_project_by_id(db, batch_data.project_id)
    if not project:
        raise NotFoundException("Project not found")

    # Process each user assignment
    assignments = []
    for user_id in batch_data.user_ids:
        # Check if user exists
        user = await get_user_by_id(db, user_id)
        if not user:
            continue  # Skip non-existent users

        # Check if assignment already exists
        existing = await get_assignment(db, batch_data.project_id, user_id)

        if existing:
            # Update role if assignment exists
            existing.role = batch_data.role
            await db.commit()
            await db.refresh(existing)
            assignments.append(existing)
        else:
            # Create new assignment
            assignment = UserAssignment(
                user_id=user_id,
                project_id=batch_data.project_id,
                role=batch_data.role,
                assigned_by=assigned_by,
            )

            db.add(assignment)
            await db.commit()
            await db.refresh(assignment)
            assignments.append(assignment)

    return assignments


async def get_assignment_with_user(
    db: AsyncSession, assignment_id: UUID
) -> Optional[Dict[str, Any]]:
    """
    Get an assignment with user information.

    Args:
        db: Database session
        assignment_id: Assignment ID

    Returns:
        Optional[Dict[str, Any]]: Assignment with user information if found, None otherwise
    """
    result = await db.execute(
        select(UserAssignment, User)
        .join(User, UserAssignment.user_id == User.id)
        .where(UserAssignment.id == assignment_id)
    )
    row = result.first()

    if not row:
        return None

    assignment, user = row

    return {
        **assignment.__dict__,
        "user": user,
    }
