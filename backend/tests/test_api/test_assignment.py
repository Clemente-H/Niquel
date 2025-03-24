import pytest
import uuid
from datetime import date
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.assignment import UserAssignment
from app.db.models.project import Project
from app.db.models.user import User


@pytest.mark.asyncio
async def test_get_project_assignments(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
):
    """Test getting assignments for a project."""
    # Create a few assignments
    user1 = User(
        id=uuid.uuid4(),
        email="assignment_user1@example.com",
        hashed_password="hashed_password",
        name="Assignment User 1",
        role="regular",
        is_active=True,
    )
    user2 = User(
        id=uuid.uuid4(),
        email="assignment_user2@example.com",
        hashed_password="hashed_password",
        name="Assignment User 2",
        role="regular",
        is_active=True,
    )
    db_session.add(user1)
    db_session.add(user2)
    await db_session.commit()

    # Create assignments
    assignment1 = UserAssignment(
        user_id=user1.id,
        project_id=test_project.id,
        role="viewer",
        assigned_by=test_user.id,
    )
    assignment2 = UserAssignment(
        user_id=user2.id,
        project_id=test_project.id,
        role="editor",
        assigned_by=test_user.id,
    )
    db_session.add(assignment1)
    db_session.add(assignment2)
    await db_session.commit()

    # Get assignments
    response = await client.get(
        f"/api/projects/{test_project.id}/assignments", headers=user_token_headers
    )
    assert response.status_code == 200
    assert "items" in response.json()
    assert len(response.json()["items"]) >= 2
    assert response.json()["total"] >= 2


@pytest.mark.asyncio
async def test_assign_user_to_project(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
):
    """Test assigning a user to a project."""
    # Create a user to assign
    user = User(
        id=uuid.uuid4(),
        email="to_assign@example.com",
        hashed_password="hashed_password",
        name="User To Assign",
        role="regular",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    assignment_data = {"user_id": str(user.id), "role": "editor"}

    response = await client.post(
        f"/api/projects/{test_project.id}/assignments",
        json=assignment_data,
        headers=user_token_headers,
    )

    assert response.status_code == 201
    assert response.json()["user_id"] == str(user.id)
    assert response.json()["project_id"] == str(test_project.id)
    assert response.json()["role"] == "editor"
    assert "user" in response.json()
    assert response.json()["user"]["name"] == "User To Assign"

    # Verify assignment was created in the database
    result = await db_session.execute(
        select(UserAssignment).where(
            UserAssignment.user_id == user.id,
            UserAssignment.project_id == test_project.id,
        )
    )
    assignment = result.scalars().first()
    assert assignment is not None
    assert assignment.role == "editor"


@pytest.mark.asyncio
async def test_batch_assign_users(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
):
    """Test batch assigning users to a project."""
    # Create users to assign
    user1 = User(
        id=uuid.uuid4(),
        email="batch_user1@example.com",
        hashed_password="hashed_password",
        name="Batch User 1",
        role="regular",
        is_active=True,
    )
    user2 = User(
        id=uuid.uuid4(),
        email="batch_user2@example.com",
        hashed_password="hashed_password",
        name="Batch User 2",
        role="regular",
        is_active=True,
    )
    db_session.add(user1)
    db_session.add(user2)
    await db_session.commit()

    batch_data = {
        "project_id": str(test_project.id),
        "user_ids": [str(user1.id), str(user2.id)],
        "role": "viewer",
    }

    response = await client.post(
        f"/api/projects/{test_project.id}/batch-assign",
        json=batch_data,
        headers=user_token_headers,
    )

    assert response.status_code == 201
    assert len(response.json()) == 2

    # Verify assignments were created in the database
    result = await db_session.execute(
        select(UserAssignment).where(
            UserAssignment.user_id.in_([user1.id, user2.id]),
            UserAssignment.project_id == test_project.id,
        )
    )
    assignments = result.scalars().all()
    assert len(assignments) == 2
    for assignment in assignments:
        assert assignment.role == "viewer"


@pytest.mark.asyncio
async def test_update_assignment(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
):
    """Test updating an assignment."""
    # Create a user and assignment
    user = User(
        id=uuid.uuid4(),
        email="update_assignment@example.com",
        hashed_password="hashed_password",
        name="Update Assignment User",
        role="regular",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    assignment = UserAssignment(
        id=uuid.uuid4(),
        user_id=user.id,
        project_id=test_project.id,
        role="viewer",
        assigned_by=test_user.id,
    )
    db_session.add(assignment)
    await db_session.commit()

    update_data = {"role": "admin"}

    response = await client.put(
        f"/api/assignments/{assignment.id}",
        json=update_data,
        headers=user_token_headers,
    )

    assert response.status_code == 200
    assert response.json()["role"] == "admin"

    # Verify database was updated
    await db_session.refresh(assignment)
    assert assignment.role == "admin"


@pytest.mark.asyncio
async def test_delete_assignment(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
):
    """Test deleting an assignment."""
    # Create a user and assignment
    user = User(
        id=uuid.uuid4(),
        email="delete_assignment@example.com",
        hashed_password="hashed_password",
        name="Delete Assignment User",
        role="regular",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    assignment = UserAssignment(
        id=uuid.uuid4(),
        user_id=user.id,
        project_id=test_project.id,
        role="viewer",
        assigned_by=test_user.id,
    )
    db_session.add(assignment)
    await db_session.commit()

    response = await client.delete(
        f"/api/assignments/{assignment.id}", headers=user_token_headers
    )

    assert response.status_code == 204

    # Verify assignment was deleted
    result = await db_session.execute(
        select(UserAssignment).where(UserAssignment.id == assignment.id)
    )
    deleted_assignment = result.scalars().first()
    assert deleted_assignment is None


@pytest.mark.asyncio
async def test_forbidden_assignment_access(
    client: AsyncClient,
    db_session: AsyncSession,
    test_manager: User,
    manager_token_headers,
):
    """Test that a user cannot access assignments from a project they don't have access to."""
    # Create a project not owned by test_manager
    project = Project(
        id=uuid.uuid4(),
        name="Project With Restricted Assignments",
        description="A project with assignments not for the manager",
        location="Test Location",
        type="Hidrología",
        status="Planificación",
        start_date=date.today(),
        owner_id=uuid.uuid4(),  # Random owner
    )
    db_session.add(project)
    await db_session.commit()

    # Create a user and assignment
    user = User(
        id=uuid.uuid4(),
        email="restricted_assignment@example.com",
        hashed_password="hashed_password",
        name="Restricted Assignment User",
        role="regular",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    assignment = UserAssignment(
        id=uuid.uuid4(),
        user_id=user.id,
        project_id=project.id,
        role="viewer",
        assigned_by=project.owner_id,
    )
    db_session.add(assignment)
    await db_session.commit()

    # Try to access the assignments
    response = await client.get(
        f"/api/projects/{project.id}/assignments", headers=manager_token_headers
    )
    assert response.status_code == 403  # Forbidden

    # Try to update the assignment
    update_data = {"role": "admin"}
    response = await client.put(
        f"/api/assignments/{assignment.id}",
        json=update_data,
        headers=manager_token_headers,
    )
    assert response.status_code == 403  # Forbidden
