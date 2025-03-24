import pytest
import uuid
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.period import Period
from app.db.models.project import Project


@pytest.mark.asyncio
async def test_get_project_periods(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    user_token_headers,
):
    """Test getting periods for a project."""
    # Create a couple of periods for the test project
    period1 = Period(
        project_id=test_project.id,
        name="Period 1",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
        created_by=test_project.owner_id,
    )
    period2 = Period(
        project_id=test_project.id,
        name="Period 2",
        start_date=date.today() + timedelta(days=31),
        end_date=date.today() + timedelta(days=60),
        created_by=test_project.owner_id,
    )
    db_session.add(period1)
    db_session.add(period2)
    await db_session.commit()

    # Get periods
    response = await client.get(
        f"/api/projects/{test_project.id}/periods", headers=user_token_headers
    )
    assert response.status_code == 200
    assert "items" in response.json()
    assert len(response.json()["items"]) >= 2
    assert response.json()["total"] >= 2


@pytest.mark.asyncio
async def test_create_period(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    user_token_headers,
):
    """Test creating a new period for a project."""
    period_data = {
        "name": "New Test Period",
        "start_date": date.today().isoformat(),
        "end_date": (date.today() + timedelta(days=30)).isoformat(),
        "project_id": str(test_project.id),
        "volume": 500.5,
        "width": 5.5,
        "max_depth": 2.5,
        "notes": "Test notes for the period",
    }

    response = await client.post(
        f"/api/projects/{test_project.id}/periods",
        json=period_data,
        headers=user_token_headers,
    )
    assert response.status_code == 201

    # Verify period was created in the database
    result = await db_session.execute(
        select(Period).where(Period.name == "New Test Period")
    )
    period = result.scalars().first()
    assert period is not None
    assert period.volume == 500.5
    assert period.width == 5.5
    assert period.max_depth == 2.5
    assert period.notes == "Test notes for the period"
    assert period.project_id == test_project.id


@pytest.mark.asyncio
async def test_get_period_by_id(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    user_token_headers,
):
    """Test getting a specific period by ID."""
    # Create a period for the test
    period = Period(
        id=uuid.uuid4(),
        project_id=test_project.id,
        name="Period For Get Test",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
        created_by=test_project.owner_id,
    )
    db_session.add(period)
    await db_session.commit()

    response = await client.get(f"/api/periods/{period.id}", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Period For Get Test"
    assert "file_count" in response.json()


@pytest.mark.asyncio
async def test_update_period(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    user_token_headers,
):
    """Test updating a period."""
    # Create a period for the test
    period = Period(
        id=uuid.uuid4(),
        project_id=test_project.id,
        name="Period To Update",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
        created_by=test_project.owner_id,
    )
    db_session.add(period)
    await db_session.commit()

    update_data = {
        "name": "Updated Period Name",
        "volume": 750.5,
        "notes": "Updated notes for the period",
    }

    response = await client.put(
        f"/api/periods/{period.id}", json=update_data, headers=user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Period Name"
    assert response.json()["volume"] == 750.5
    assert response.json()["notes"] == "Updated notes for the period"

    # Verify database was updated
    await db_session.refresh(period)
    assert period.name == "Updated Period Name"
    assert period.volume == 750.5
    assert period.notes == "Updated notes for the period"


@pytest.mark.asyncio
async def test_delete_period(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    user_token_headers,
):
    """Test deleting a period."""
    # Create a period for the test
    period = Period(
        id=uuid.uuid4(),
        project_id=test_project.id,
        name="Period To Delete",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
        created_by=test_project.owner_id,
    )
    db_session.add(period)
    await db_session.commit()

    response = await client.delete(
        f"/api/periods/{period.id}", headers=user_token_headers
    )
    assert response.status_code == 204

    # Verify period was deleted
    result = await db_session.execute(select(Period).where(Period.id == period.id))
    deleted_period = result.scalars().first()
    assert deleted_period is None


@pytest.mark.asyncio
async def test_forbidden_period_access(
    client: AsyncClient, db_session: AsyncSession, test_manager, manager_token_headers
):
    """Test that a user cannot access periods from a project they don't have access to."""
    # Create a new project not owned by test_manager
    project = Project(
        id=uuid.uuid4(),
        name="Project Not For Manager",
        description="A project not for the manager",
        location="Test Location",
        type="Hidrología",
        status="Planificación",
        start_date=date.today(),
        owner_id=uuid.uuid4(),  # Random owner
    )
    db_session.add(project)
    await db_session.commit()

    # Create a period for this project
    period = Period(
        id=uuid.uuid4(),
        project_id=project.id,
        name="Forbidden Period",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
        created_by=project.owner_id,
    )
    db_session.add(period)
    await db_session.commit()

    # Try to access the period
    response = await client.get(
        f"/api/periods/{period.id}", headers=manager_token_headers
    )
    assert response.status_code == 403  # Forbidden
