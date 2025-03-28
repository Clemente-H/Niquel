from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, func

from app.api.deps import CurrentUser, DbSession
from app.api.routes.projects import check_project_access, check_project_edit_access
from app.core.exceptions import NotFoundException
from app.db.models.period import Period
from app.db.models.file import File
from app.models.period import (
    Period as PeriodSchema,
    PeriodCreate,
    PeriodUpdate,
    PaginatedPeriods,
    PeriodWithDetails,
)

router = APIRouter(tags=["periods"])


@router.get("/projects/{project_id}/periods", response_model=PaginatedPeriods)
async def get_project_periods(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 10,
):
    """
    Retrieve all periods for a specific project.
    """
    # Check if user has access to this project
    has_access = await check_project_access(db, project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this project",
        )

    # Get total count for pagination
    count_query = select(func.count()).select_from(
        select(Period).where(Period.project_id == project_id).subquery()
    )
    result = await db.execute(count_query)
    total = result.scalar_one()

    # Get paginated results
    query = (
        select(Period)
        .where(Period.project_id == project_id)
        .order_by(Period.start_date.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    periods = result.scalars().all()

    return {
        "items": periods,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "page_size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1,
    }


@router.post(
    "/projects/{project_id}/periods",
    response_model=PeriodSchema,
    status_code=status.HTTP_201_CREATED,
)
async def create_period(
    project_id: UUID,
    period_data: PeriodCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Create a new period for a project.
    """
    # Check if user has edit access to this project
    has_access = await check_project_edit_access(db, project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to edit this project",
        )

    # Create new period
    # Dentro de la función create_period
    period = Period(
        project_id=project_id,
        name=period_data.name,
        start_date=period_data.start_date,
        end_date=period_data.end_date,
        volume=period_data.volume,
        start_time=period_data.start_time,
        width=period_data.width,
        max_depth=period_data.max_depth,
        notes=period_data.notes,
        created_by=current_user.id,
        kml_file_id=period_data.kml_file_id,
    )

    db.add(period)
    await db.commit()
    await db.refresh(period)

    return period


@router.get("/periods/{period_id}", response_model=PeriodWithDetails)
async def get_period(
    period_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Get a specific period by ID.
    """
    # Get period
    result = await db.execute(select(Period).where(Period.id == period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has access to the related project
    has_access = await check_project_access(db, period.project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this period",
        )

    # Get file count
    result = await db.execute(
        select(func.count(File.id)).where(File.period_id == period_id)
    )
    file_count = result.scalar_one()

    # Combine period with file count
    period_dict = {**period.__dict__}
    period_dict["file_count"] = file_count

    return period_dict


@router.put("/periods/{period_id}", response_model=PeriodSchema)
async def update_period(
    period_id: UUID,
    period_data: PeriodUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Update a period.
    """
    # Get period
    result = await db.execute(select(Period).where(Period.id == period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has edit access to the related project
    has_access = await check_project_edit_access(db, period.project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to edit this period",
        )

    # Update period fields
    for key, value in period_data.dict(exclude_unset=True).items():
        if key == "kml_file_id" and value is None:
            continue
        setattr(period, key, value)

    await db.commit()
    await db.refresh(period)

    return period


@router.delete("/periods/{period_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_period(
    period_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Delete a period.
    """
    # Get period
    result = await db.execute(select(Period).where(Period.id == period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has edit access to the related project
    has_access = await check_project_edit_access(db, period.project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this period",
        )

    await db.delete(period)
    await db.commit()
