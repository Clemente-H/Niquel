import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.project import Project
from app.db.models.assignment import UserAssignment


@pytest.mark.asyncio
async def test_get_projects(
    client: AsyncClient, test_project: Project, user_token_headers
):
    """Test getting a list of projects accessible by the user."""
    response = await client.get("/api/projects", headers=user_token_headers)
    assert response.status_code == 200
    assert "items" in response.json()
    assert len(response.json()["items"]) >= 1
    assert response.json()["total"] >= 1


@pytest.mark.asyncio
async def test_get_projects_admin_sees_all(
    client: AsyncClient, test_project: Project, admin_token_headers
):
    """Test that an admin can see all projects."""
    response = await client.get("/api/projects", headers=admin_token_headers)
    assert response.status_code == 200
    assert "items" in response.json()
    assert len(response.json()["items"]) >= 1
    assert response.json()["total"] >= 1


@pytest.mark.asyncio
async def test_create_project(
    client: AsyncClient, user_token_headers, db_session: AsyncSession
):
    """Test creating a new project."""
    tomorrow = date.today() + timedelta(days=1)
    project_data = {
        "name": "New Test Project",
        "description": "A test project created in tests",
        "location": "Test Location",
        "type": "Hidrología",
        "start_date": tomorrow.isoformat(),
    }
    response = await client.post(
        "/api/projects", json=project_data, headers=user_token_headers
    )
    assert response.status_code == 201

    # Verify project was created in the database
    result = await db_session.execute(
        select(Project).where(Project.name == "New Test Project")
    )
    project = result.scalars().first()
    assert project is not None
    assert project.description == "A test project created in tests"
    assert project.type == "Hidrología"
    assert project.status == "Planificación"  # Default status


@pytest.mark.asyncio
async def test_get_project_by_id(
    client: AsyncClient, test_project: Project, user_token_headers
):
    """Test getting a specific project by ID."""
    response = await client.get(
        f"/api/projects/{test_project.id}", headers=user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == test_project.name
    assert response.json()["description"] == test_project.description
    assert "period_count" in response.json()
    assert "file_count" in response.json()
    assert "assigned_users_count" in response.json()


@pytest.mark.asyncio
async def test_get_project_not_found(client: AsyncClient, user_token_headers):
    """Test getting a project that doesn't exist."""
    response = await client.get(
        "/api/projects/00000000-0000-0000-0000-000000000000", headers=user_token_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_project_owner(
    client: AsyncClient,
    test_project: Project,
    user_token_headers,
    db_session: AsyncSession,
):
    """Test that a project owner can update their project."""
    update_data = {
        "name": "Updated Project Name",
        "status": "En progreso",
    }
    response = await client.put(
        f"/api/projects/{test_project.id}", json=update_data, headers=user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Project Name"
    assert response.json()["status"] == "En progreso"

    # Verify database was updated
    await db_session.refresh(test_project)
    assert test_project.name == "Updated Project Name"
    assert test_project.status == "En progreso"


@pytest.mark.asyncio
async def test_update_project_admin(
    client: AsyncClient,
    test_project: Project,
    admin_token_headers,
    db_session: AsyncSession,
):
    """Test that an admin can update any project."""
    update_data = {
        "name": "Admin Updated Project",
        "description": "Updated by admin",
    }
    response = await client.put(
        f"/api/projects/{test_project.id}",
        json=update_data,
        headers=admin_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Admin Updated Project"
    assert response.json()["description"] == "Updated by admin"

    # Verify database was updated
    await db_session.refresh(test_project)
    assert test_project.name == "Admin Updated Project"
    assert test_project.description == "Updated by admin"


@pytest.mark.asyncio
async def test_update_project_not_owner_forbidden(
    client: AsyncClient, db_session: AsyncSession, manager_token_headers, test_user
):
    """Test that a non-owner user cannot update a project without proper assignment."""
    # Create a new project owned by test_user
    import uuid

    project = Project(
        id=uuid.uuid4(),
        name="Project Not Owned By Manager",
        description="A project not owned by the manager",
        location="Test Location",
        type="Hidrología",
        status="Planificación",
        start_date=date.today(),
        owner_id=test_user.id,
    )
    db_session.add(project)
    await db_session.commit()

    # Try to update as manager (not owner and no assignment)
    update_data = {
        "name": "Should Not Update",
    }
    response = await client.put(
        f"/api/projects/{project.id}", json=update_data, headers=manager_token_headers
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_delete_project_owner(
    client: AsyncClient, user_token_headers, db_session: AsyncSession, test_user
):
    """Test that a project owner can delete their project."""
    # Create a new project to delete
    project = Project(
        id=uuid.uuid4(),
        name="Project To Delete",
        description="A project that will be deleted",
        location="Test Location",
        type="Hidrología",
        status="Planificación",
        start_date=date.today(),
        owner_id=test_user.id,
    )
    db_session.add(project)
    await db_session.commit()

    response = await client.delete(
        f"/api/projects/{project.id}", headers=user_token_headers
    )
    assert response.status_code == 204

    # Verify project was deleted
    result = await db_session.execute(select(Project).where(Project.id == project.id))
    deleted_project = result.scalars().first()
    assert deleted_project is None


@pytest.mark.asyncio
async def test_delete_project_admin(
    client: AsyncClient, admin_token_headers, db_session: AsyncSession, test_user
):
    """Test that an admin can delete any project."""
    # Create a new project to delete
    project = Project(
        id=uuid.uuid4(),
        name="Project For Admin To Delete",
        description="A project that will be deleted by admin",
        location="Test Location",
        type="Hidrología",
        status="Planificación",
        start_date=date.today(),
        owner_id=test_user.id,
    )
    db_session.add(project)
    await db_session.commit()

    response = await client.delete(
        f"/api/projects/{project.id}", headers=admin_token_headers
    )
    assert response.status_code == 204

    # Verify project was deleted
    result = await db_session.execute(select(Project).where(Project.id == project.id))
    deleted_project = result.scalars().first()
    assert deleted_project is None


@pytest.mark.asyncio
async def test_delete_project_not_owner_forbidden(
    client: AsyncClient, db_session: AsyncSession, manager_token_headers, test_user
):
    """Test that a non-owner user cannot delete a project without proper assignment."""
    # Create a new project owned by test_user
    project = Project(
        id=uuid.uuid4(),
        name="Project Not To Delete",
        description="A project not to be deleted by non-owner",
        location="Test Location",
        type="Hidrología",
        status="Planificación",
        start_date=date.today(),
        owner_id=test_user.id,
    )
    db_session.add(project)
    await db_session.commit()

    # Try to delete as manager (not owner and no assignment)
    response = await client.delete(
        f"/api/projects/{project.id}", headers=manager_token_headers
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_project_editor_can_update(
    client: AsyncClient,
    db_session: AsyncSession,
    manager_token_headers,
    test_project,
    test_manager,
):
    """Test that a user with editor assignment can update a project."""
    # Assign the manager as an editor
    assignment = UserAssignment(
        user_id=test_manager.id,
        project_id=test_project.id,
        role="editor",
        assigned_by=test_project.owner_id,
    )
    db_session.add(assignment)
    await db_session.commit()

    # Update as editor
    update_data = {
        "name": "Updated By Editor",
        "description": "This project was updated by an editor",
    }
    response = await client.put(
        f"/api/projects/{test_project.id}",
        json=update_data,
        headers=manager_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated By Editor"

    # Verify database was updated
    await db_session.refresh(test_project)
    assert test_project.name == "Updated By Editor"


@pytest.mark.asyncio
async def test_project_editor_cannot_delete(
    client: AsyncClient,
    db_session: AsyncSession,
    manager_token_headers,
    test_project,
    test_manager,
):
    """Test that a user with editor assignment cannot delete a project."""
    # Make sure the manager is assigned as editor
    assignment = UserAssignment(
        user_id=test_manager.id,
        project_id=test_project.id,
        role="editor",
        assigned_by=test_project.owner_id,
    )
    db_session.add(assignment)
    await db_session.commit()

    # Try to delete as editor
    response = await client.delete(
        f"/api/projects/{test_project.id}", headers=manager_token_headers
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_project_admin_can_delete(
    client: AsyncClient,
    db_session: AsyncSession,
    manager_token_headers,
    test_project,
    test_manager,
):
    """Test that a user with admin assignment can delete a project."""
    # Update the manager's role to admin for this project
    # Check if assignment already exists
    result = await db_session.execute(
        select(UserAssignment).where(
            UserAssignment.user_id == test_manager.id,
            UserAssignment.project_id == test_project.id,
        )
    )
    existing_assignment = result.scalars().first()

    if existing_assignment:
        # Update role to admin
        existing_assignment.role = "admin"
    else:
        # Create new assignment with admin role
        assignment = UserAssignment(
            user_id=test_manager.id,
            project_id=test_project.id,
            role="admin",
            assigned_by=test_project.owner_id,
        )
        db_session.add(assignment)

    await db_session.commit()

    # Delete as project admin
    response = await client.delete(
        f"/api/projects/{test_project.id}", headers=manager_token_headers
    )
    assert response.status_code == 204

    # Verify project was deleted
    result = await db_session.execute(
        select(Project).where(Project.id == test_project.id)
    )
    deleted_project = result.scalars().first()
    assert deleted_project is None
