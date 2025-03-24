# flake8: noqa: W503
#!/usr/bin/env python3

"""
Seed data script for Niquel backend.
This script populates the database with initial test data.
"""

import asyncio
import datetime
import logging
import random
import uuid
from typing import Dict, List

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import engine
from app.db.models.user import User
from app.db.models.project import Project
from app.db.models.period import Period
from app.db.models.file import File
from app.db.models.assignment import UserAssignment

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Note: This is a placeholder. Actual implementation will be created
# once we have defined our database models and session management.

# Sample data
USERS = [
    {
        "email": "admin@example.com",
        "password": "password",
        "name": "Admin User",
        "role": "admin",
    },
    {
        "email": "manager@example.com",
        "password": "password",
        "name": "Manager User",
        "role": "manager",
    },
    {
        "email": "user@example.com",
        "password": "password",
        "name": "Regular User",
        "role": "regular",
    },
    {
        "email": "carlos@example.com",
        "password": "password",
        "name": "Carlos Méndez",
        "role": "admin",
    },
    {
        "email": "maria@example.com",
        "password": "password",
        "name": "María González",
        "role": "manager",
    },
    {
        "email": "juan@example.com",
        "password": "password",
        "name": "Juan Rodríguez",
        "role": "regular",
    },
    {
        "email": "ana@example.com",
        "password": "password",
        "name": "Ana Martínez",
        "role": "regular",
    },
    {
        "email": "pedro@example.com",
        "password": "password",
        "name": "Pedro López",
        "role": "regular",
    },
]

PROJECT_TYPES = ["Hidrología", "Conservación", "Monitoreo", "Análisis", "Restauración"]
PROJECT_STATUSES = ["Planificación", "En progreso", "En revisión", "Completado"]
PROJECT_LOCATIONS = [
    "Sector Norte - Coordenadas: 32°50'16.8\"S 70°35'56.4\"W",
    "Sector Este - Región Metropolitana",
    "Zona Central - Cuenca del Maipo",
    "Cordillera - Sierra Bella",
    "Región Metropolitana - Canal San Carlos",
    "Valle del Elqui - Río Claro",
    "Costa Central - Laguna Verde",
    "Zona Sur - Río Biobío",
]

PROJECT_NAMES = [
    "Canal Los Andes",
    "Gestión Hídrica Río Mapocho",
    "Monitoreo Cuenca del Maipo",
    "Análisis Pluvial Sierra Bella",
    "Restauración Canal San Carlos",
    "Conservación Río Clarillo",
    "Monitoreo de Caudales Río Aconcagua",
    "Sistema de Riego Valle Central",
    "Evaluación de Calidad de Agua Laguna Aculeo",
    "Restauración Humedal El Yali",
]

PROJECT_DESCRIPTIONS = [
    "Proyecto de monitoreo y mantenimiento del Canal Los Andes, incluyendo análisis de caudal y calidad del agua en diferentes tramos.",
    "Proyecto de conservación y gestión sostenible de los recursos hídricos del Río Mapocho, con foco en la calidad del agua y control de contaminantes.",
    "Sistema de monitoreo continuo de la Cuenca del Maipo, incluyendo mediciones de caudal, calidad de agua y variables meteorológicas.",
    "Estudio pluvial comprehensivo de la zona Sierra Bella, con análisis de patrones de precipitación y escorrentía.",
    "Proyecto de restauración ecológica y funcional del Canal San Carlos, incluyendo mejoras en la infraestructura y restauración de la vegetación riparia.",
    "Iniciativa de conservación integral del ecosistema del Río Clarillo, con énfasis en la protección de especies nativas y control de especies invasoras.",
    "Sistema de monitoreo automatizado de caudales en el Río Aconcagua, con estaciones de medición en tiempo real en puntos estratégicos.",
    "Desarrollo e implementación de un sistema de riego eficiente para agricultores del Valle Central, con tecnología de precisión y ahorro de agua.",
    "Evaluación completa de parámetros fisicoquímicos y biológicos para determinar la calidad del agua en la Laguna Aculeo y proponer medidas de recuperación.",
    "Proyecto de restauración del Humedal El Yali, incluyendo recuperación de hábitats degradados y reintroducción de especies nativas.",
]

PERIOD_NAMES = [
    "Enero 2025",
    "Febrero 2025",
    "Marzo 2025",
    "Abril 2025",
    "Mayo 2025",
    "Junio 2025",
    "Julio 2025",
    "Agosto 2025",
    "Septiembre 2025",
    "Octubre 2025",
    "Noviembre 2025",
    "Diciembre 2025",
]

FILE_CATEGORIES = ["map", "image", "document", "analysis"]
FILE_NAMES = {
    "map": [
        "mapa_recorrido.kml",
        "mapa_sectores.geojson",
        "mapa_puntos_muestreo.kml",
        "zonificacion.kml",
    ],
    "image": [
        "foto_canal.jpg",
        "imagen_sector_norte.png",
        "vista_aerea.jpg",
        "imagen_analisis.jpg",
    ],
    "document": [
        "informe_tecnico.pdf",
        "especificaciones.pdf",
        "metodologia.pdf",
        "anexos.pdf",
    ],
    "analysis": [
        "datos_caudal.csv",
        "analisis_calidad_agua.xlsx",
        "mediciones.csv",
        "resultados_monitoreo.xlsx",
    ],
}


async def create_session() -> AsyncSession:
    """Create a new async session."""
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    return async_session()


async def clean_database(session: AsyncSession):
    """Clean existing data from the database."""
    logger.info("Cleaning existing data...")

    # Delete in proper order to respect foreign key constraints
    await session.execute(sa.delete(UserAssignment))
    await session.execute(sa.delete(File))
    await session.execute(sa.delete(Period))
    await session.execute(sa.delete(Project))
    await session.execute(sa.delete(User))

    await session.commit()
    logger.info("Database cleaned.")


async def create_users(session: AsyncSession) -> Dict[str, uuid.UUID]:
    """Create sample users in the database."""
    logger.info("Creating users...")

    user_ids = {}
    for user_data in USERS:
        user = User(
            id=uuid.uuid4(),
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            name=user_data["name"],
            role=user_data["role"],
            is_active=True,
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now(),
        )
        session.add(user)
        user_ids[user_data["email"]] = user.id

    await session.commit()
    logger.info(f"Created {len(USERS)} users.")
    return user_ids


async def create_projects(
    session: AsyncSession, user_ids: Dict[str, uuid.UUID]
) -> List[uuid.UUID]:
    """Create sample projects in the database."""
    logger.info("Creating projects...")

    project_ids = []
    admin_id = user_ids["admin@example.com"]
    manager_id = user_ids["manager@example.com"]
    carlos_id = user_ids["carlos@example.com"]
    maria_id = user_ids["maria@example.com"]

    # List of possible owner IDs
    owner_ids = [admin_id, manager_id, carlos_id, maria_id]

    # Create projects with random attributes but specific names and descriptions
    for i, (name, description) in enumerate(zip(PROJECT_NAMES, PROJECT_DESCRIPTIONS)):
        # Select a consistent location for each project
        location = PROJECT_LOCATIONS[i % len(PROJECT_LOCATIONS)]

        # Create start date between 1-3 months ago
        days_ago = random.randint(30, 90)
        start_date = datetime.date.today() - datetime.timedelta(days=days_ago)

        project = Project(
            id=uuid.uuid4(),
            name=name,
            description=description,
            location=location,
            type=random.choice(PROJECT_TYPES),
            status=random.choice(PROJECT_STATUSES),
            owner_id=random.choice(owner_ids),
            start_date=start_date,
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now(),
        )
        session.add(project)
        project_ids.append(project.id)

    await session.commit()
    logger.info(f"Created {len(project_ids)} projects.")
    return project_ids


async def create_periods(
    session: AsyncSession, project_ids: List[uuid.UUID], user_ids: Dict[str, uuid.UUID]
) -> List[uuid.UUID]:
    """Create sample periods for projects in the database."""
    logger.info("Creating periods...")

    period_ids = []
    admin_id = user_ids["admin@example.com"]

    for project_id in project_ids:
        # Generate 3-6 periods for each project
        num_periods = random.randint(3, 6)

        for i in range(num_periods):
            # Create periods with sequential dates
            period_name = PERIOD_NAMES[i % len(PERIOD_NAMES)]
            start_date = datetime.date.today() + datetime.timedelta(days=i * 30)
            end_date = start_date + datetime.timedelta(days=29)

            # Random metrics for water data
            volume = random.uniform(100.0, 1000.0) if random.random() > 0.3 else None
            width = random.uniform(2.0, 10.0) if random.random() > 0.3 else None
            max_depth = random.uniform(0.5, 5.0) if random.random() > 0.3 else None

            # Random time (for specific measurements)
            hour = random.randint(8, 17)
            minute = random.choice([0, 15, 30, 45])
            start_time = datetime.time(hour, minute) if random.random() > 0.5 else None

            # Random notes (sometimes empty)
            notes = None
            if random.random() > 0.6:
                note_options = [
                    "Se observaron niveles normales de sedimentos.",
                    "El caudal se mantuvo estable durante el período.",
                    "Se detectaron variaciones significativas después de las lluvias.",
                    "Condiciones óptimas para monitoreo.",
                    "Se requiere mantenimiento preventivo en algunos puntos.",
                ]
                notes = random.choice(note_options)

            period = Period(
                id=uuid.uuid4(),
                project_id=project_id,
                name=period_name,
                start_date=start_date,
                end_date=end_date,
                volume=volume,
                start_time=start_time,
                width=width,
                max_depth=max_depth,
                notes=notes,
                created_at=datetime.datetime.now(),
                updated_at=datetime.datetime.now(),
                created_by=admin_id,
            )
            session.add(period)
            period_ids.append(period.id)

    await session.commit()
    logger.info(f"Created {len(period_ids)} periods.")
    return period_ids


async def create_files(
    session: AsyncSession,
    project_ids: List[uuid.UUID],
    period_ids: List[uuid.UUID],
    user_ids: Dict[str, uuid.UUID],
) -> None:
    """Create sample files in the database."""
    logger.info("Creating files...")

    # Get user IDs for file uploads
    uploader_ids = [
        user_ids[email] for email in random.sample(list(user_ids.keys()), 3)
    ]

    # Create files for projects
    file_count = 0
    for project_id in project_ids:
        # 2-4 files per project
        num_files = random.randint(2, 4)

        for _ in range(num_files):
            category = random.choice(FILE_CATEGORIES)
            file_name = random.choice(FILE_NAMES[category])

            # Generate a dummy path that would be created by the file service
            path = f"{settings.UPLOAD_DIR}/{uuid.uuid4()}/{file_name}"

            # Random file size between 100KB and 10MB
            size = random.randint(100 * 1024, 10 * 1024 * 1024)

            # Generate appropriate content type based on file extension
            content_type = "application/octet-stream"  # Default
            if file_name.endswith(".pdf"):
                content_type = "application/pdf"
            elif file_name.endswith(".jpg"):
                content_type = "image/jpeg"
            elif file_name.endswith(".png"):
                content_type = "image/png"
            elif file_name.endswith(".csv"):
                content_type = "text/csv"
            elif file_name.endswith(".xlsx"):
                content_type = (
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
            elif file_name.endswith(".kml"):
                content_type = "application/vnd.google-earth.kml+xml"
            elif file_name.endswith(".geojson"):
                content_type = "application/geo+json"

            file = File(
                id=uuid.uuid4(),
                name=file_name,
                path=path,
                size=size,
                content_type=content_type,
                category=category,
                project_id=project_id,
                period_id=None,  # Files attached to project, not period
                uploaded_by=random.choice(uploader_ids),
                upload_date=datetime.datetime.now()
                - datetime.timedelta(days=random.randint(1, 30)),
            )
            session.add(file)
            file_count += 1

    # Create files for periods (fewer than for projects)
    for period_id in random.sample(period_ids, min(len(period_ids) // 2, 10)):
        # Get the project_id for this period
        result = await session.execute(
            sa.select(Period.project_id).where(Period.id == period_id)
        )
        project_id = result.scalar_one()

        category = random.choice(FILE_CATEGORIES)
        file_name = random.choice(FILE_NAMES[category])

        # Generate a dummy path
        path = f"{settings.UPLOAD_DIR}/{uuid.uuid4()}/{file_name}"

        # Random file size between 100KB and 10MB
        size = random.randint(100 * 1024, 10 * 1024 * 1024)

        # Generate appropriate content type based on file extension
        content_type = "application/octet-stream"  # Default
        if file_name.endswith(".pdf"):
            content_type = "application/pdf"
        elif file_name.endswith(".jpg"):
            content_type = "image/jpeg"
        elif file_name.endswith(".png"):
            content_type = "image/png"
        elif file_name.endswith(".csv"):
            content_type = "text/csv"
        elif file_name.endswith(".xlsx"):
            content_type = (
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        elif file_name.endswith(".kml"):
            content_type = "application/vnd.google-earth.kml+xml"
        elif file_name.endswith(".geojson"):
            content_type = "application/geo+json"

        file = File(
            id=uuid.uuid4(),
            name=file_name,
            path=path,
            size=size,
            content_type=content_type,
            category=category,
            project_id=project_id,
            period_id=period_id,  # Files attached to period
            uploaded_by=random.choice(uploader_ids),
            upload_date=datetime.datetime.now()
            - datetime.timedelta(days=random.randint(1, 15)),
        )
        session.add(file)
        file_count += 1

    await session.commit()
    logger.info(f"Created {file_count} files.")


async def create_user_assignments(
    session: AsyncSession, project_ids: List[uuid.UUID], user_ids: Dict[str, uuid.UUID]
) -> None:
    """Create sample user assignments for projects in the database."""
    logger.info("Creating user assignments...")

    assignments_count = 0
    admin_id = user_ids["admin@example.com"]

    # Create assignments for regular users
    regular_users = [
        user_id
        for email, user_id in user_ids.items()
        if email not in ["admin@example.com", "manager@example.com"]
    ]

    for project_id in project_ids:
        # First, add the owner as admin
        # Get the project owner
        result = await session.execute(
            sa.select(Project.owner_id).where(Project.id == project_id)
        )
        owner_id = result.scalar_one()

        # Skip if owner is already assigned
        if owner_id != admin_id:
            assignment = UserAssignment(
                id=uuid.uuid4(),
                user_id=owner_id,
                project_id=project_id,
                role="admin",  # Project owner always gets admin role
                assigned_at=datetime.datetime.now()
                - datetime.timedelta(days=random.randint(1, 30)),
                assigned_by=admin_id,
            )
            session.add(assignment)
            assignments_count += 1

        # Now add 2-4 random users with random roles
        num_assignments = random.randint(2, 4)

        # Randomly sample regular users to assign
        assigned_users = random.sample(
            regular_users, min(num_assignments, len(regular_users))
        )

        for user_id in assigned_users:
            # Don't add duplicate assignments
            if user_id == owner_id:
                continue

            role = random.choice(["viewer", "editor", "admin"])

            assignment = UserAssignment(
                id=uuid.uuid4(),
                user_id=user_id,
                project_id=project_id,
                role=role,
                assigned_at=datetime.datetime.now()
                - datetime.timedelta(days=random.randint(1, 15)),
                assigned_by=admin_id,
            )
            session.add(assignment)
            assignments_count += 1

    await session.commit()
    logger.info(f"Created {assignments_count} user assignments.")


async def seed_database():
    """Seed the database with sample data."""
    logger.info("Starting database seeding process...")

    session = await create_session()

    try:
        # Clean existing data
        await clean_database(session)

        # Create users
        user_ids = await create_users(session)

        # Create projects
        project_ids = await create_projects(session, user_ids)

        # Create periods
        period_ids = await create_periods(session, project_ids, user_ids)

        # Create files
        await create_files(session, project_ids, period_ids, user_ids)

        # Create user assignments
        await create_user_assignments(session, project_ids, user_ids)

        logger.info("Database seeding completed successfully.")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        await session.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
