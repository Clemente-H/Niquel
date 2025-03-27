import asyncio
from app.db.base import Base
from app.db.session import engine

# Importar todos los modelos para que SQLAlchemy los conozca
from app.db.models import *  # noqa: F403, F401


async def create_tables():
    """Create all tables in the database."""
    print("Creating tables...")
    async with engine.begin() as conn:
        # Eliminar tablas existentes (opcional)
        await conn.run_sync(Base.metadata.drop_all)
        # Crear todas las tablas
        await conn.run_sync(Base.metadata.create_all)

    print("Tables created successfully!")


if __name__ == "__main__":
    asyncio.run(create_tables())
