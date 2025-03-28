from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.db.models.geo_point import GeoPoint
from app.models.geo_point import GeoPointCreate, GeoPointUpdate


async def get_geo_point_by_id(
    db: AsyncSession, geo_point_id: UUID
) -> Optional[GeoPoint]:
    """
    Get a geo point by ID.

    Args:
        db: Database session
        geo_point_id: Geo point ID

    Returns:
        Optional[GeoPoint]: Geo point if found, None otherwise
    """
    result = await db.execute(select(GeoPoint).where(GeoPoint.id == geo_point_id))
    return result.scalars().first()


async def get_geo_points_by_period(
    db: AsyncSession,
    period_id: UUID,
    skip: int = 0,
    limit: int = 100,
) -> List[GeoPoint]:
    """
    Get geo points for a period.

    Args:
        db: Database session
        period_id: Period ID
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[GeoPoint]: List of geo points
    """
    query = select(GeoPoint).where(GeoPoint.period_id == period_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all()


async def get_geo_points_count(
    db: AsyncSession,
    period_id: Optional[UUID] = None,
) -> int:
    """
    Get count of geo points with optional filtering.

    Args:
        db: Database session
        period_id: Optional period ID filter

    Returns:
        int: Count of geo points
    """
    query = select(func.count(GeoPoint.id))

    if period_id:
        query = query.where(GeoPoint.period_id == period_id)

    result = await db.execute(query)
    return result.scalar_one()


async def create_geo_point(
    db: AsyncSession, geo_point_data: GeoPointCreate, created_by: UUID
) -> GeoPoint:
    """
    Create a new geo point.

    Args:
        db: Database session
        geo_point_data: Geo point data
        created_by: User ID who created the geo point

    Returns:
        GeoPoint: Created geo point
    """
    # Create new geo point
    geo_point = GeoPoint(
        latitude=geo_point_data.latitude,
        longitude=geo_point_data.longitude,
        gravity_level=geo_point_data.gravity_level,
        description=geo_point_data.description,
        kilometer=geo_point_data.kilometer,
        section=geo_point_data.section,
        period_id=geo_point_data.period_id,
        created_by=created_by,
    )

    db.add(geo_point)
    await db.commit()
    await db.refresh(geo_point)

    return geo_point


async def update_geo_point(
    db: AsyncSession, geo_point_id: UUID, geo_point_data: GeoPointUpdate
) -> GeoPoint:
    """
    Update a geo point.

    Args:
        db: Database session
        geo_point_id: Geo point ID
        geo_point_data: Updated geo point data

    Returns:
        GeoPoint: Updated geo point

    Raises:
        NotFoundException: If geo point not found
    """
    geo_point = await get_geo_point_by_id(db, geo_point_id)
    if not geo_point:
        raise NotFoundException("Geo point not found")

    # Update fields
    update_data = geo_point_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(geo_point, field, value)

    await db.commit()
    await db.refresh(geo_point)

    return geo_point


async def delete_geo_point(db: AsyncSession, geo_point_id: UUID) -> bool:
    """
    Delete a geo point.

    Args:
        db: Database session
        geo_point_id: Geo point ID

    Returns:
        bool: True if geo point was deleted, False otherwise

    Raises:
        NotFoundException: If geo point not found
    """
    geo_point = await get_geo_point_by_id(db, geo_point_id)
    if not geo_point:
        raise NotFoundException("Geo point not found")

    await db.delete(geo_point)
    await db.commit()

    return True
