import pytest
from uuid import UUID
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.user import User


@pytest.mark.asyncio
async def test_get_users_admin(client: AsyncClient, admin_token_headers):
    """Test that an admin can retrieve all users."""
    response = await client.get("/api/users", headers=admin_token_headers)
    assert response.status_code == 200
    assert "items" in response.json()
    assert response.json()["total"] >= 1  # At least the admin user


@pytest.mark.asyncio
async def test_get_users_regular_forbidden(client: AsyncClient, user_token_headers):
    """Test that a regular user cannot retrieve all users."""
    response = await client.get("/api/users", headers=user_token_headers)
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_get_current_user(
    client: AsyncClient, test_user: User, user_token_headers
):
    """Test that a user can retrieve their own information."""
    response = await client.get("/api/users/me", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email
    assert response.json()["name"] == test_user.name
    assert response.json()["role"] == test_user.role


@pytest.mark.asyncio
async def test_get_user_by_id_self(
    client: AsyncClient, test_user: User, user_token_headers
):
    """Test that a user can retrieve their own information by ID."""
    response = await client.get(
        f"/api/users/{test_user.id}", headers=user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email
    assert response.json()["name"] == test_user.name


@pytest.mark.asyncio
async def test_get_user_by_id_other_forbidden(
    client: AsyncClient, test_admin: User, user_token_headers
):
    """Test that a regular user cannot retrieve another user's information."""
    response = await client.get(
        f"/api/users/{test_admin.id}", headers=user_token_headers
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_get_user_by_id_admin(
    client: AsyncClient, test_user: User, admin_token_headers
):
    """Test that an admin can retrieve any user's information."""
    response = await client.get(
        f"/api/users/{test_user.id}", headers=admin_token_headers
    )
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email
    assert response.json()["name"] == test_user.name


@pytest.mark.asyncio
async def test_create_user_admin(
    client: AsyncClient, admin_token_headers, db_session: AsyncSession
):
    """Test that an admin can create a new user."""
    user_data = {
        "email": "new_user_admin@example.com",
        "password": "password123",
        "name": "New User From Admin",
        "role": "regular",
    }
    response = await client.post(
        "/api/users", json=user_data, headers=admin_token_headers
    )
    assert response.status_code == 201

    # Verify user was created in the database
    result = await db_session.execute(
        select(User).where(User.email == "new_user_admin@example.com")
    )
    user = result.scalars().first()
    assert user is not None
    assert user.name == "New User From Admin"
    assert user.role == "regular"


@pytest.mark.asyncio
async def test_create_user_regular_forbidden(client: AsyncClient, user_token_headers):
    """Test that a regular user cannot create a new user."""
    user_data = {
        "email": "another_user@example.com",
        "password": "password123",
        "name": "Another User",
        "role": "regular",
    }
    response = await client.post(
        "/api/users", json=user_data, headers=user_token_headers
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_update_user_self(
    client: AsyncClient, test_user: User, user_token_headers, db_session: AsyncSession
):
    """Test that a user can update their own information."""
    update_data = {
        "name": "Updated Name",
    }
    response = await client.put(
        f"/api/users/{test_user.id}", json=update_data, headers=user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"

    # Verify database was updated
    await db_session.refresh(test_user)
    assert test_user.name == "Updated Name"


@pytest.mark.asyncio
async def test_update_user_other_forbidden(
    client: AsyncClient, test_admin: User, user_token_headers
):
    """Test that a regular user cannot update another user's information."""
    update_data = {
        "name": "Should Not Update",
    }
    response = await client.put(
        f"/api/users/{test_admin.id}", json=update_data, headers=user_token_headers
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_update_user_admin(
    client: AsyncClient, test_user: User, admin_token_headers, db_session: AsyncSession
):
    """Test that an admin can update any user's information."""
    update_data = {
        "name": "Admin Updated Name",
        "role": "manager",  # Only admins can update roles
    }
    response = await client.put(
        f"/api/users/{test_user.id}", json=update_data, headers=admin_token_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Admin Updated Name"
    assert response.json()["role"] == "manager"

    # Verify database was updated
    await db_session.refresh(test_user)
    assert test_user.name == "Admin Updated Name"
    assert test_user.role == "manager"


@pytest.mark.asyncio
async def test_delete_user_admin(
    client: AsyncClient, admin_token_headers, db_session: AsyncSession
):
    """Test that an admin can delete a user."""
    # Create a user to delete
    user_to_delete = User(
        id=UUID("00000000-0000-0000-0000-000000000099"),
        email="to_delete@example.com",
        hashed_password="hashed_password",
        name="User To Delete",
        role="regular",
        is_active=True,
    )
    db_session.add(user_to_delete)
    await db_session.commit()

    response = await client.delete(
        f"/api/users/{user_to_delete.id}", headers=admin_token_headers
    )
    assert response.status_code == 204

    # Verify user was deleted
    result = await db_session.execute(select(User).where(User.id == user_to_delete.id))
    user = result.scalars().first()
    assert user is None


@pytest.mark.asyncio
async def test_delete_user_self_forbidden(
    client: AsyncClient, test_user: User, user_token_headers
):
    """Test that a user cannot delete themselves."""
    response = await client.delete(
        f"/api/users/{test_user.id}", headers=user_token_headers
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_delete_user_other_forbidden(
    client: AsyncClient, test_admin: User, user_token_headers
):
    """Test that a regular user cannot delete another user."""
    response = await client.delete(
        f"/api/users/{test_admin.id}", headers=user_token_headers
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_admin_cannot_delete_self(
    client: AsyncClient, test_admin: User, admin_token_headers
):
    """Test that even admins cannot delete themselves."""
    response = await client.delete(
        f"/api/users/{test_admin.id}", headers=admin_token_headers
    )
    assert response.status_code == 400  # Bad Request
