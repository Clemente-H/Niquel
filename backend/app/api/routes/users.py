from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentAdminUser, CurrentUser, DbSession
from app.core.exceptions import NotFoundException
from app.core.security import get_password_hash
from app.db.models.user import User
from app.models.user import User as UserSchema, UserCreate, UserUpdate, PaginatedUsers

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=PaginatedUsers)
async def get_users(
    db: DbSession,
    current_user: CurrentAdminUser,
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve users. Only admins can access this endpoint.
    """
    # Get total count for pagination
    result = await db.execute(select(User).order_by(User.name))
    users = result.scalars().all()
    total = len(users)

    # Get paginated results
    result = await db.execute(
        select(User).order_by(User.name).offset(skip).limit(limit)
    )
    users = result.scalars().all()

    return {
        "items": users,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "page_size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1,
    }


@router.get("/me", response_model=UserSchema)
async def read_current_user(current_user: CurrentUser):
    """
    Get current user.
    """
    return current_user


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Get a specific user by ID.
    Regular users can only access their own user data.
    Admins can access any user data.
    """
    # Check if user is trying to access their own data or is an admin
    if str(current_user.id) != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise NotFoundException("User not found")

    return user


@router.post("", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: DbSession,
    current_user: CurrentAdminUser,
):
    """
    Create new user. Only admins can access this endpoint.
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name,
        role=user_data.role,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Update a user.
    Regular users can only update their own data.
    Admins can update any user data.
    """
    # Check if user is trying to access their own data or is an admin
    if str(current_user.id) != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise NotFoundException("User not found")

    # Update user fields
    if user_data.email is not None:
        user.email = user_data.email

    if user_data.name is not None:
        user.name = user_data.name

    # Only admins can update roles
    if user_data.role is not None and current_user.role == "admin":
        user.role = user_data.role

    if user_data.is_active is not None and current_user.role == "admin":
        user.is_active = user_data.is_active

    if user_data.password is not None:
        user.hashed_password = get_password_hash(user_data.password)

    await db.commit()
    await db.refresh(user)

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: DbSession,
    current_user: CurrentAdminUser,
):
    """
    Delete a user. Only admins can access this endpoint.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise NotFoundException("User not found")

    # Prevent deleting yourself
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own user",
        )

    await db.delete(user)
    await db.commit()
