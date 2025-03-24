from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import CredentialsException, NotFoundException
from app.core.security import get_password_hash, verify_password
from app.db.models.user import User
from app.models.user import UserCreate, UserUpdate


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """
    Get a user by ID.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        Optional[User]: User if found, None otherwise
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Get a user by email.

    Args:
        db: Database session
        email: User email

    Returns:
        Optional[User]: User if found, None otherwise
    """
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Get all users with pagination.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[User]: List of users
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()


async def get_total_users(db: AsyncSession) -> int:
    """
    Get total count of users.

    Args:
        db: Database session

    Returns:
        int: Total count of users
    """
    result = await db.execute(select(func.count()).select_from(User))
    return result.scalar_one()


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """
    Create a new user.

    Args:
        db: Database session
        user_data: User data

    Returns:
        User: Created user
    """
    # Check if user already exists
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise ValueError("Email already registered")

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name,
        role=user_data.role,
        is_active=True,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


async def update_user(db: AsyncSession, user_id: UUID, user_data: UserUpdate) -> User:
    """
    Update a user.

    Args:
        db: Database session
        user_id: User ID
        user_data: Updated user data

    Returns:
        User: Updated user

    Raises:
        NotFoundException: If user not found
    """
    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundException("User not found")

    # Update fields
    update_data = user_data.dict(exclude_unset=True)

    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)

    return user


async def delete_user(db: AsyncSession, user_id: UUID) -> bool:
    """
    Delete a user.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        bool: True if user was deleted, False otherwise

    Raises:
        NotFoundException: If user not found
    """
    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundException("User not found")

    await db.delete(user)
    await db.commit()

    return True


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """
    Authenticate a user.

    Args:
        db: Database session
        email: User email
        password: Plain password

    Returns:
        User: Authenticated user

    Raises:
        CredentialsException: If authentication fails
    """
    user = await get_user_by_email(db, email)

    if not user:
        raise CredentialsException("Incorrect email or password")

    if not verify_password(password, user.hashed_password):
        raise CredentialsException("Incorrect email or password")

    if not user.is_active:
        raise CredentialsException("Inactive user")

    return user
