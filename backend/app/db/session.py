from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Convert PostgresDsn to string for SQLAlchemy and ensure it has the right prefix
database_url = str(settings.DATABASE_URL)
# Ensure we use the async driver
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")

# Create an async engine for working with asyncio
engine = create_async_engine(
    database_url,
    echo=settings.DEBUG,
    future=True,
)

# Create a session factory that will create AsyncSession instances
async_session_factory = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db():
    """
    Dependency that provides a database session.

    Yields:
        AsyncSession: A database session.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
