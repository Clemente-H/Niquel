import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.user import User


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user: User):
    """Test successful login."""
    login_data = {
        "username": test_user.email,
        "password": "password",
    }
    response = await client.post("/api/auth/token", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user: User):
    """Test login with wrong password."""
    login_data = {
        "username": test_user.email,
        "password": "wrong_password",
    }
    response = await client.post("/api/auth/token", data=login_data)
    assert response.status_code == 401
    assert "access_token" not in response.json()


@pytest.mark.asyncio
async def test_login_invalid_email(client: AsyncClient):
    """Test login with invalid email."""
    login_data = {
        "username": "nonexistent@example.com",
        "password": "password",
    }
    response = await client.post("/api/auth/token", data=login_data)
    assert response.status_code == 401
    assert "access_token" not in response.json()


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient, db_session: AsyncSession):
    """Test successful user registration."""
    register_data = {
        "email": "new_user@example.com",
        "password": "password123",
        "name": "New User",
        "role": "regular",
    }
    response = await client.post("/api/auth/register", json=register_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

    # Verify user was created in the database
    result = await db_session.execute(
        select(User).where(User.email == "new_user@example.com")
    )
    user = result.scalars().first()
    assert user is not None
    assert user.name == "New User"
    assert user.role == "regular"


@pytest.mark.asyncio
async def test_register_existing_email(client: AsyncClient, test_user: User):
    """Test registration with existing email."""
    register_data = {
        "email": test_user.email,  # Email already exists
        "password": "password123",
        "name": "Duplicate User",
        "role": "regular",
    }
    response = await client.post("/api/auth/register", json=register_data)
    assert response.status_code == 409  # Conflict
    assert "access_token" not in response.json()
