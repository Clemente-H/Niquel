import pytest
import io
import os
import uuid
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.file import File
from app.db.models.project import Project
from app.db.models.period import Period
from app.db.models.user import User
from app.core.config import settings


@pytest.mark.asyncio
async def test_get_files(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
):
    """Test getting files for a project."""
    # Create a few files
    file1 = File(
        id=uuid.uuid4(),
        name="test_file1.txt",
        path=f"{settings.UPLOAD_DIR}/test_file1.txt",
        size=1024,
        content_type="text/plain",
        category="document",
        project_id=test_project.id,
        uploaded_by=test_user.id,
    )
    file2 = File(
        id=uuid.uuid4(),
        name="test_file2.jpg",
        path=f"{settings.UPLOAD_DIR}/test_file2.jpg",
        size=2048,
        content_type="image/jpeg",
        category="image",
        project_id=test_project.id,
        uploaded_by=test_user.id,
    )
    db_session.add(file1)
    db_session.add(file2)
    await db_session.commit()

    # Get files
    response = await client.get(
        f"/api/files?project_id={test_project.id}", headers=user_token_headers
    )
    assert response.status_code == 200
    assert "items" in response.json()
    assert len(response.json()["items"]) >= 2
    assert response.json()["total"] >= 2

    # Filter by category
    response = await client.get(
        f"/api/files?project_id={test_project.id}&category=image",
        headers=user_token_headers,
    )
    assert response.status_code == 200
    assert len(response.json()["items"]) >= 1
    assert any(item["name"] == "test_file2.jpg" for item in response.json()["items"])


@pytest.mark.asyncio
async def test_upload_file_to_project(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    user_token_headers,
    monkeypatch,
):
    """Test uploading a file to a project."""

    # Mock file operations to avoid actual file I/O during tests
    async def mock_save_upload_file(upload_file, upload_dir):
        file_path = f"{upload_dir}/{upload_file.filename}"
        return file_path, len(upload_file.file.read())

    # Import here to allow patching
    from app.utils import file_utils

    monkeypatch.setattr(file_utils, "save_upload_file", mock_save_upload_file)
    monkeypatch.setattr(
        file_utils,
        "create_upload_dir",
        lambda project_id: f"{settings.UPLOAD_DIR}/{project_id}",
    )

    # Create a test file
    file_content = b"This is a test file content."
    file = io.BytesIO(file_content)

    # Upload file
    response = await client.post(
        "/api/files",
        files={"file": ("test_upload.txt", file, "text/plain")},
        data={
            "project_id": str(test_project.id),
            "category": "document",
        },
        headers=user_token_headers,
    )

    assert response.status_code == 201
    assert response.json()["name"] == "test_upload.txt"
    assert response.json()["content_type"] == "text/plain"
    assert response.json()["project_id"] == str(test_project.id)
    assert response.json()["category"] == "document"

    # Verify file was added to the database
    result = await db_session.execute(
        select(File).where(
            File.name == "test_upload.txt", File.project_id == test_project.id
        )
    )
    uploaded_file = result.scalars().first()
    assert uploaded_file is not None
    assert uploaded_file.content_type == "text/plain"
    assert uploaded_file.category == "document"


@pytest.mark.asyncio
async def test_upload_file_to_period(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
    monkeypatch,
):
    """Test uploading a file to a period."""
    # Create a period
    period = Period(
        id=uuid.uuid4(),
        project_id=test_project.id,
        name="Period For File Upload",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
        created_by=test_user.id,
    )
    db_session.add(period)
    await db_session.commit()

    # Mock file operations
    async def mock_save_upload_file(upload_file, upload_dir):
        file_path = f"{upload_dir}/{upload_file.filename}"
        return file_path, len(upload_file.file.read())

    # Import here to allow patching
    from app.utils import file_utils

    monkeypatch.setattr(file_utils, "save_upload_file", mock_save_upload_file)
    monkeypatch.setattr(
        file_utils,
        "create_upload_dir",
        lambda project_id: f"{settings.UPLOAD_DIR}/{project_id}",
    )

    # Create a test file
    file_content = b"This is a period file content."
    file = io.BytesIO(file_content)

    # Upload file to period
    response = await client.post(
        "/api/files",
        files={"file": ("period_file.txt", file, "text/plain")},
        data={
            "project_id": str(test_project.id),
            "period_id": str(period.id),
            "category": "document",
        },
        headers=user_token_headers,
    )

    assert response.status_code == 201
    assert response.json()["name"] == "period_file.txt"
    assert response.json()["project_id"] == str(test_project.id)
    assert response.json()["period_id"] == str(period.id)

    # Verify file was added to the database with period_id
    result = await db_session.execute(
        select(File).where(File.name == "period_file.txt", File.period_id == period.id)
    )
    uploaded_file = result.scalars().first()
    assert uploaded_file is not None
    assert uploaded_file.period_id == period.id


@pytest.mark.asyncio
async def test_get_file_by_id(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
):
    """Test getting a specific file by ID."""
    # Create a file
    file = File(
        id=uuid.uuid4(),
        name="get_by_id.txt",
        path=f"{settings.UPLOAD_DIR}/get_by_id.txt",
        size=1024,
        content_type="text/plain",
        category="document",
        project_id=test_project.id,
        uploaded_by=test_user.id,
    )
    db_session.add(file)
    await db_session.commit()

    # Get file by ID
    response = await client.get(f"/api/files/{file.id}", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "get_by_id.txt"
    assert response.json()["content_type"] == "text/plain"
    assert response.json()["category"] == "document"


@pytest.mark.asyncio
async def test_delete_file(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    test_user: User,
    user_token_headers,
    monkeypatch,
):
    """Test deleting a file."""
    # Create a file
    file = File(
        id=uuid.uuid4(),
        name="to_delete.txt",
        path=f"{settings.UPLOAD_DIR}/to_delete.txt",
        size=1024,
        content_type="text/plain",
        category="document",
        project_id=test_project.id,
        uploaded_by=test_user.id,
    )
    db_session.add(file)
    await db_session.commit()

    # Mock file deletion
    def mock_exists(path):
        return True

    def mock_remove(path):
        return None

    monkeypatch.setattr(os.path, "exists", mock_exists)
    monkeypatch.setattr(os, "remove", mock_remove)

    # Delete file
    response = await client.delete(f"/api/files/{file.id}", headers=user_token_headers)
    assert response.status_code == 204

    # Verify file was deleted from database
    result = await db_session.execute(select(File).where(File.id == file.id))
    deleted_file = result.scalars().first()
    assert deleted_file is None


@pytest.mark.asyncio
async def test_forbidden_file_access(
    client: AsyncClient, db_session: AsyncSession, user_token_headers
):
    """Test that a user cannot access files from a project they don't have access to."""
    # Create a project and file not accessible to the test user
    other_owner_id = uuid.uuid4()
    project = Project(
        id=uuid.uuid4(),
        name="Project With Restricted Files",
        description="A project with files not accessible",
        location="Test Location",
        type="Hidrología",
        status="Planificación",
        start_date=date.today(),
        owner_id=other_owner_id,
    )
    db_session.add(project)
    await db_session.commit()

    # Create a file in this project
    file = File(
        id=uuid.uuid4(),
        name="restricted.txt",
        path=f"{settings.UPLOAD_DIR}/restricted.txt",
        size=1024,
        content_type="text/plain",
        category="document",
        project_id=project.id,
        uploaded_by=other_owner_id,
    )
    db_session.add(file)
    await db_session.commit()

    # Try to get the file
    response = await client.get(f"/api/files/{file.id}", headers=user_token_headers)
    assert response.status_code == 403  # Forbidden

    # Try to delete the file
    response = await client.delete(f"/api/files/{file.id}", headers=user_token_headers)
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_file_validation(
    client: AsyncClient,
    db_session: AsyncSession,
    test_project: Project,
    user_token_headers,
    monkeypatch,
):
    """Test file validation during upload."""

    # Mock file operations
    async def mock_save_upload_file(upload_file, upload_dir):
        file_path = f"{upload_dir}/{upload_file.filename}"
        return file_path, len(upload_file.file.read())

    # Import here to allow patching
    from app.utils import file_utils

    monkeypatch.setattr(file_utils, "save_upload_file", mock_save_upload_file)
    monkeypatch.setattr(
        file_utils,
        "create_upload_dir",
        lambda project_id: f"{settings.UPLOAD_DIR}/{project_id}",
    )

    # Create a test file with invalid category
    file_content = b"This is a test file content."
    file = io.BytesIO(file_content)

    # Upload file with invalid category
    response = await client.post(
        "/api/files",
        files={"file": ("test_invalid.txt", file, "text/plain")},
        data={
            "project_id": str(test_project.id),
            "category": "invalid_category",  # Invalid category
        },
        headers=user_token_headers,
    )

    assert response.status_code == 400  # Bad request


@pytest.mark.asyncio
async def test_file_upload_without_project(
    client: AsyncClient, user_token_headers, monkeypatch
):
    """Test file upload without project ID or period ID."""

    # Mock file operations
    async def mock_save_upload_file(upload_file, upload_dir):
        file_path = f"{upload_dir}/{upload_file.filename}"
        return file_path, len(upload_file.file.read())

    # Import here to allow patching
    from app.utils import file_utils

    monkeypatch.setattr(file_utils, "save_upload_file", mock_save_upload_file)
    monkeypatch.setattr(
        file_utils,
        "create_upload_dir",
        lambda project_id: f"{settings.UPLOAD_DIR}/{project_id}",
    )

    # Create a test file
    file_content = b"This is a test file content."
    file = io.BytesIO(file_content)

    # Upload file without project ID or period ID
    response = await client.post(
        "/api/files",
        files={"file": ("no_project.txt", file, "text/plain")},
        data={
            "category": "document",
        },
        headers=user_token_headers,
    )

    assert response.status_code == 400  # Bad request
