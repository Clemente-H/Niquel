import asyncio
import uuid
from typing import AsyncGenerator, Dict

import pytest_asyncio
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text

from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from app.db.base import Base
from app.db.models.user import User
from app.db.models.project import Project
from app.main import app as main_app

# Use a test database instead of the main one
TEST_DATABASE_URL = settings.DATABASE_URL.replace(
    "/" + settings.DATABASE_URL.split("/")[-1], "/test_niquel"
)

# Create async engine for the test database
engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
)

# Session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def setup_database():
    """Setup the test database once before all tests."""
    # Connect to postgres database to create test database
    admin_engine = create_async_engine(
        settings.DATABASE_URL.rsplit("/", 1)[0] + "/postgres",
        isolation_level="AUTOCOMMIT",
    )

    async with admin_engine.begin() as conn:
        # Drop test database if it exists and create it anew
        await conn.execute(text('DROP DATABASE IF EXISTS "test_niquel"'))
        await conn.execute(text('CREATE DATABASE "test_niquel"'))

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # Drop all tables after tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    # Close engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(setup_database) -> AsyncGenerator[AsyncSession, None]:
    """Get a database session for a test."""
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()


@pytest_asyncio.fixture
def app(db_session) -> FastAPI:
    """Get a FastAPI app with overridden dependencies."""

    # Replace the get_db dependency with test_get_db
    async def test_get_db():
        try:
            yield db_session
        finally:
            pass

    main_app.dependency_overrides = {}

    # Override the get_db dependency
    from app.api.deps import get_db

    main_app.dependency_overrides[get_db] = test_get_db

    return main_app


@pytest_asyncio.fixture
async def client(app) -> AsyncGenerator[AsyncClient, None]:
    """Get an async HTTP client for testing API endpoints."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def test_user(db_session) -> User:
    """Create a test user."""
    user = User(
        id=uuid.uuid4(),
        email="test_user@example.com",
        hashed_password=get_password_hash("password"),
        name="Test User",
        role="regular",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_admin(db_session) -> User:
    """Create a test admin user."""
    admin = User(
        id=uuid.uuid4(),
        email="test_admin@example.com",
        hashed_password=get_password_hash("password"),
        name="Test Admin",
        role="admin",
        is_active=True,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture
async def test_manager(db_session) -> User:
    """Create a test manager user."""
    manager = User(
        id=uuid.uuid4(),
        email="test_manager@example.com",
        hashed_password=get_password_hash("password"),
        name="Test Manager",
        role="manager",
        is_active=True,
    )
    db_session.add(manager)
    await db_session.commit()
    await db_session.refresh(manager)
    return manager


@pytest_asyncio.fixture
async def test_project(db_session, test_user) -> Project:
    """Create a test project."""
    project = Project(
        id=uuid.uuid4(),
        name="Test Project",
        description="A test project",
        location="Test Location",
        type="Hidrología",
        status="Planificación",
        start_date="2025-01-01",
        owner_id=test_user.id,
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
def user_token_headers(test_user) -> Dict[str, str]:
    """Return authorization headers for the test user."""
    token = create_access_token(subject=str(test_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
def admin_token_headers(test_admin) -> Dict[str, str]:
    """Return authorization headers for the test admin."""
    token = create_access_token(subject=str(test_admin.id))
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
def manager_token_headers(test_manager) -> Dict[str, str]:
    """Return authorization headers for the test manager."""
    token = create_access_token(subject=str(test_manager.id))
    return {"Authorization": f"Bearer {token}"}
