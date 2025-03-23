from typing import Annotated
import uuid

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.exceptions import CredentialsException, ForbiddenException
from app.db.session import get_db
from app.db.models.user import User

# OAuth2 scheme for token handling
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

# Database session dependency
DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    """
    Get the current authenticated user from the token.

    Args:
        db: The database session.
        token: The JWT token.

    Returns:
        User: The authenticated user.

    Raises:
        CredentialsException: If the token is invalid or the user doesn't exist.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise CredentialsException("Invalid authentication credentials")
    except JWTError:
        raise CredentialsException("Invalid authentication credentials")

    # Convert string to UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise CredentialsException("Invalid user ID")

    # Get user from database
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalars().first()

    if user is None:
        raise CredentialsException("User not found")

    if not user.is_active:
        raise CredentialsException("Inactive user")

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Get the current active user.

    Args:
        current_user: The current authenticated user.

    Returns:
        User: The current active user.

    Raises:
        CredentialsException: If the user is inactive.
    """
    if not current_user.is_active:
        raise CredentialsException("Inactive user")
    return current_user


async def get_current_admin_user(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """
    Get the current admin user.

    Args:
        current_user: The current authenticated user.

    Returns:
        User: The current admin user.

    Raises:
        ForbiddenException: If the user is not an admin.
    """
    if current_user.role != "admin":
        raise ForbiddenException("The user doesn't have enough privileges")
    return current_user


async def get_current_manager_or_admin_user(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """
    Get the current manager or admin user.

    Args:
        current_user: The current authenticated user.

    Returns:
        User: The current manager or admin user.

    Raises:
        ForbiddenException: If the user is not a manager or admin.
    """
    if current_user.role not in ["admin", "manager"]:
        raise ForbiddenException("The user doesn't have enough privileges")
    return current_user


# Create reusable dependencies
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentActiveUser = Annotated[User, Depends(get_current_active_user)]
CurrentAdminUser = Annotated[User, Depends(get_current_admin_user)]
CurrentManagerOrAdminUser = Annotated[User, Depends(get_current_manager_or_admin_user)]
