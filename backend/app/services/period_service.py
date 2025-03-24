from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import date

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.db.models.period import Period
from app.db.models.file import File
from app.services.project_service import get_project_by_id
from app.models.period import PeriodCreate, PeriodUpdate


async def get_period_by_id(db: AsyncSession, period_id: UUID) -> Optional[Period]:
    """
    Get a period by ID.

    Args:
        db: Database session
        period_id: Period ID

    Returns:
        Optional[Period]: Period if found, None otherwise
    """
    result = await db.execute(select(Period).where(Period.id == period_id))
    return result.scalars().first()


async def get_periods(
    db: AsyncSession,
    project_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Period]:
    """
    Get periods with optional filtering.

    Args:
        db: Database session
        project_id: Optional project ID filter
        start_date: Optional start date filter (periods starting on or after this date)
        end_date: Optional end date filter (periods ending on or before this date)
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[Period]: List of periods
    """
    query = select(Period)

    # Apply filters
    if project_id:
        query = query.where(Period.project_id == project_id)

    if start_date:
        query = query.where(Period.start_date >= start_date)

    if end_date:
        query = query.where(Period.end_date <= end_date)

    query = query.order_by(Period.start_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all()


async def get_periods_count(
    db: AsyncSession,
    project_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> int:
    """
    Get count of periods with optional filtering.

    Args:
        db: Database session
        project_id: Optional project ID filter
        start_date: Optional start date filter (periods starting on or after this date)
        end_date: Optional end date filter (periods ending on or before this date)

    Returns:
        int: Count of periods
    """
    query = select(func.count(Period.id))

    # Apply filters
    if project_id:
        query = query.where(Period.project_id == project_id)

    if start_date:
        query = query.where(Period.start_date >= start_date)

    if end_date:
        query = query.where(Period.end_date <= end_date)

    result = await db.execute(query)
    return result.scalar_one()


async def create_period(
    db: AsyncSession, period_data: PeriodCreate, created_by: UUID
) -> Period:
    """
    Create a new period.

    Args:
        db: Database session
        period_data: Period data
        created_by: User ID who created the period

    Returns:
        Period: Created period

    Raises:
        NotFoundException: If project not found
    """
    # Check if project exists
    project = await get_project_by_id(db, period_data.project_id)
    if not project:
        raise NotFoundException("Project not found")

    # Create new period
    period = Period(
        project_id=period_data.project_id,
        name=period_data.name,
        start_date=period_data.start_date,
        end_date=period_data.end_date,
        volume=period_data.volume,
        start_time=period_data.start_time,
        width=period_data.width,
        max_depth=period_data.max_depth,
        notes=period_data.notes,
        created_by=created_by,
    )

    db.add(period)
    await db.commit()
    await db.refresh(period)

    return period


async def update_period(
    db: AsyncSession, period_id: UUID, period_data: PeriodUpdate
) -> Period:
    """
    Update a period.

    Args:
        db: Database session
        period_id: Period ID
        period_data: Updated period data

    Returns:
        Period: Updated period

    Raises:
        NotFoundException: If period not found
    """
    period = await get_period_by_id(db, period_id)
    if not period:
        raise NotFoundException("Period not found")

    # Update fields
    update_data = period_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(period, field, value)

    await db.commit()
    await db.refresh(period)

    return period


async def delete_period(db: AsyncSession, period_id: UUID) -> bool:
    """
    Delete a period.

    Args:
        db: Database session
        period_id: Period ID

    Returns:
        bool: True if period was deleted, False otherwise

    Raises:
        NotFoundException: If period not found
    """
    period = await get_period_by_id(db, period_id)
    if not period:
        raise NotFoundException("Period not found")

    await db.delete(period)
    await db.commit()

    return True


async def get_period_stats(db: AsyncSession, period_id: UUID) -> Dict[str, Any]:
    """
    Get statistics for a period.

    Args:
        db: Database session
        period_id: Period ID

    Returns:
        Dict[str, Any]: Period statistics

    Raises:
        NotFoundException: If period not found
    """
    period = await get_period_by_id(db, period_id)
    if not period:
        raise NotFoundException("Period not found")

    # Get file count
    file_count_result = await db.execute(
        select(func.count(File.id)).where(File.period_id == period_id)
    )
    file_count = file_count_result.scalar_one()

    return {
        **period.__dict__,
        "file_count": file_count,
    }


async def get_periods_by_category(
    db: AsyncSession,
    project_id: UUID,
    category: str,
    skip: int = 0,
    limit: int = 100,
) -> List[Period]:
    """
    Get periods that have files of a specific category.

    Args:
        db: Database session
        project_id: Project ID
        category: File category
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[Period]: List of periods
    """
    # Get periods that have files with the specified category
    query = (
        select(Period)
        .distinct()
        .join(File, File.period_id == Period.id)
        .where(Period.project_id == project_id, File.category == category)
        .order_by(Period.start_date.desc())
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)
    return result.scalars().all()
