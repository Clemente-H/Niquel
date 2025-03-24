# app/api/routes/assignments.py
from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, func

from app.api.deps import CurrentUser, DbSession
from app.api.routes.projects import check_project_admin_access
from app.core.exceptions import NotFoundException
from app.db.models.assignment import UserAssignment
from app.db.models.user import User
from app.models.assignment import (
    UserAssignment as UserAssignmentSchema,
    UserAssignmentCreate,
    UserAssignmentUpdate,
    UserAssignmentWithUser,
    PaginatedUserAssignments,
    BatchAssignment,
)

router = APIRouter(tags=["assignments"])


@router.get(
    "/projects/{project_id}/assignments", response_model=PaginatedUserAssignments
)
async def get_project_assignments(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 20,
):
    """
    Get all assignments for a project.
    """
    # Check if user has access to this project
    has_access = await check_project_admin_access(db, project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view project assignments",
        )

    # Get total count for pagination
    count_query = select(func.count()).select_from(
        select(UserAssignment).where(UserAssignment.project_id == project_id).subquery()
    )
    result = await db.execute(count_query)
    total = result.scalar_one()

    # Get paginated results
    query = (
        select(UserAssignment)
        .where(UserAssignment.project_id == project_id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    assignments = result.scalars().all()

    return {
        "items": assignments,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "page_size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1,
    }


@router.post(
    "/projects/{project_id}/assignments",
    response_model=UserAssignmentWithUser,
    status_code=status.HTTP_201_CREATED,
)
async def assign_user_to_project(
    project_id: UUID,
    assignment: UserAssignmentCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Add a user to a project with a specific role.
    """
    # Check if user has admin access to this project
    has_access = await check_project_admin_access(db, project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to manage project assignments",
        )

    # Check if user exists
    user_result = await db.execute(select(User).where(User.id == assignment.user_id))
    user = user_result.scalars().first()

    if not user:
        raise NotFoundException("User not found")

    # Check if assignment already exists
    existing_result = await db.execute(
        select(UserAssignment).where(
            UserAssignment.user_id == assignment.user_id,
            UserAssignment.project_id == project_id,
        )
    )
    existing = existing_result.scalars().first()

    if existing:
        # Update role if assignment exists
        existing.role = assignment.role
        await db.commit()
        await db.refresh(existing)

        # Return with user info
        return {
            **existing.__dict__,
            "user": user,
        }

    # Create new assignment
    new_assignment = UserAssignment(
        user_id=assignment.user_id,
        project_id=project_id,
        role=assignment.role,
        assigned_by=current_user.id,
    )

    db.add(new_assignment)
    await db.commit()
    await db.refresh(new_assignment)

    # Return with user info
    return {
        **new_assignment.__dict__,
        "user": user,
    }


@router.post(
    "/projects/{project_id}/batch-assign",
    response_model=List[UserAssignmentSchema],
    status_code=status.HTTP_201_CREATED,
)
async def batch_assign_users(
    project_id: UUID,
    batch: BatchAssignment,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Assign multiple users to a project with the same role.
    """
    # Check if user has admin access to this project
    has_access = await check_project_admin_access(db, project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to manage project assignments",
        )

    # Validate project_id matches
    if batch.project_id != project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project ID in path and body must match",
        )

    # Process each user assignment
    assignments = []
    for user_id in batch.user_ids:
        # Check if user exists
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalars().first()

        if not user:
            continue  # Skip non-existent users

        # Check if assignment already exists
        existing_result = await db.execute(
            select(UserAssignment).where(
                UserAssignment.user_id == user_id,
                UserAssignment.project_id == project_id,
            )
        )
        existing = existing_result.scalars().first()

        if existing:
            # Update role if assignment exists
            existing.role = batch.role
            await db.commit()
            await db.refresh(existing)
            assignments.append(existing)
        else:
            # Create new assignment
            new_assignment = UserAssignment(
                user_id=user_id,
                project_id=project_id,
                role=batch.role,
                assigned_by=current_user.id,
            )

            db.add(new_assignment)
            await db.commit()
            await db.refresh(new_assignment)
            assignments.append(new_assignment)

    return assignments


@router.put("/assignments/{assignment_id}", response_model=UserAssignmentSchema)
async def update_assignment(
    assignment_id: UUID,
    assignment_update: UserAssignmentUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Update an assignment role.
    """
    # Get assignment
    result = await db.execute(
        select(UserAssignment).where(UserAssignment.id == assignment_id)
    )
    assignment = result.scalars().first()

    if not assignment:
        raise NotFoundException("Assignment not found")

    # Check if user has admin access to this project
    has_access = await check_project_admin_access(
        db, assignment.project_id, current_user
    )
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update project assignments",
        )

    # Update assignment
    if assignment_update.role is not None:
        assignment.role = assignment_update.role

    await db.commit()
    await db.refresh(assignment)

    return assignment


@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment(
    assignment_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Remove a user from a project.
    """
    # Get assignment
    result = await db.execute(
        select(UserAssignment).where(UserAssignment.id == assignment_id)
    )
    assignment = result.scalars().first()

    if not assignment:
        raise NotFoundException("Assignment not found")

    # Check if user has admin access to this project
    has_access = await check_project_admin_access(
        db, assignment.project_id, current_user
    )
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete project assignments",
        )

    await db.delete(assignment)
    await db.commit()
