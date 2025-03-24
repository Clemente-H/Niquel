from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.api.deps import DbSession
from app.core.config import settings
from app.core.exceptions import CredentialsException
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.models.user import User
from app.models.token import Token
from app.models.user import UserCreate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession,
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise CredentialsException("Incorrect email or password")

    if not user.is_active:
        raise CredentialsException("Inactive user")

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=Token)
async def register_user(user_data: UserCreate, db: DbSession):
    """
    Register a new user and return an access token.
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

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
