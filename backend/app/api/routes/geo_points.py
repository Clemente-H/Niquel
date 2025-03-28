from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, File, UploadFile, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.api.routes.projects import check_project_access, check_project_edit_access
from app.core.exceptions import NotFoundException
from app.db.models.period import Period
from app.services.geo_point_service import (
    get_geo_point_by_id,
    get_geo_points_by_period,
    get_geo_points_count,
    create_geo_point,
    update_geo_point,
    delete_geo_point,
)
from app.services.geo_point_image_service import (
    get_geo_point_images,
    upload_geo_point_image,
    delete_geo_point_image,
)
from app.models.geo_point import (
    GeoPoint,
    GeoPointCreate,
    GeoPointUpdate,
    PaginatedGeoPoints,
    GeoPointWithImages,
    GeoPointImage,
)

router = APIRouter(tags=["geo_points"])


@router.get("/periods/{period_id}/geo-points", response_model=PaginatedGeoPoints)
async def get_period_geo_points(
    period_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 20,
):
    """
    Get all geo points for a period.
    """
    # Get period to check project access
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

    # Get total count for pagination
    total = await get_geo_points_count(db, period_id)

    # Get paginated geo points
    geo_points = await get_geo_points_by_period(db, period_id, skip, limit)

    return {
        "items": geo_points,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "page_size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1,
    }


@router.post(
    "/periods/{period_id}/geo-points",
    response_model=GeoPoint,
    status_code=status.HTTP_201_CREATED,
)
async def create_period_geo_point(
    period_id: UUID,
    geo_point_data: GeoPointCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Create a new geo point for a period.
    """
    # Get period to check project access
    result = await db.execute(select(Period).where(Period.id == period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has edit access to the related project
    has_edit_access = await check_project_edit_access(
        db, period.project_id, current_user
    )
    if not has_edit_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to edit this period",
        )

    # Ensure the geo point is associated with the correct period
    if geo_point_data.period_id != period_id:
        geo_point_data.period_id = period_id

    # Create the geo point
    geo_point = await create_geo_point(db, geo_point_data, current_user.id)
    return geo_point


@router.get(
    "/geo-points/{geo_point_id}",
    response_model=GeoPointWithImages,
)
async def get_geo_point_detail(
    geo_point_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Get a specific geo point by ID with its images.
    """
    # Get geo point
    geo_point = await get_geo_point_by_id(db, geo_point_id)
    if not geo_point:
        raise NotFoundException("Geo point not found")

    # Get period to check project access
    result = await db.execute(select(Period).where(Period.id == geo_point.period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has access to the related project
    has_access = await check_project_access(db, period.project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this geo point",
        )

    # Get images for the geo point
    images = await get_geo_point_images(db, geo_point_id)

    # Return geo point with images
    return {
        **geo_point.__dict__,
        "images": images,
    }


@router.put(
    "/geo-points/{geo_point_id}",
    response_model=GeoPoint,
)
async def update_geo_point_detail(
    geo_point_id: UUID,
    geo_point_data: GeoPointUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Update a specific geo point.
    """
    # Get geo point
    geo_point = await get_geo_point_by_id(db, geo_point_id)
    if not geo_point:
        raise NotFoundException("Geo point not found")

    # Get period to check project access
    result = await db.execute(select(Period).where(Period.id == geo_point.period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has edit access to the related project
    has_edit_access = await check_project_edit_access(
        db, period.project_id, current_user
    )
    if not has_edit_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to edit this geo point",
        )

    # Update the geo point
    updated_geo_point = await update_geo_point(db, geo_point_id, geo_point_data)
    return updated_geo_point


@router.delete(
    "/geo-points/{geo_point_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_geo_point_detail(
    geo_point_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Delete a specific geo point.
    """
    # Get geo point
    geo_point = await get_geo_point_by_id(db, geo_point_id)
    if not geo_point:
        raise NotFoundException("Geo point not found")

    # Get period to check project access
    result = await db.execute(select(Period).where(Period.id == geo_point.period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has edit access to the related project
    has_edit_access = await check_project_edit_access(
        db, period.project_id, current_user
    )
    if not has_edit_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this geo point",
        )

    # Delete the geo point
    await delete_geo_point(db, geo_point_id)


@router.post(
    "/geo-points/{geo_point_id}/images",
    response_model=GeoPointImage,
    status_code=status.HTTP_201_CREATED,
)
async def upload_geo_point_image_endpoint(
    geo_point_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
):
    """
    Upload an image for a geo point.
    """
    # Get geo point
    geo_point = await get_geo_point_by_id(db, geo_point_id)
    if not geo_point:
        raise NotFoundException("Geo point not found")

    # Get period to check project access
    result = await db.execute(select(Period).where(Period.id == geo_point.period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has edit access to the related project
    has_edit_access = await check_project_edit_access(
        db, period.project_id, current_user
    )
    if not has_edit_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to upload images for this geo point",
        )

    # Upload the image
    image = await upload_geo_point_image(db, file, geo_point_id, current_user.id)
    return image


@router.get(
    "/geo-points/{geo_point_id}/images",
    response_model=List[GeoPointImage],
)
async def get_geo_point_images_endpoint(
    geo_point_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Get all images for a geo point.
    """
    # Get geo point
    geo_point = await get_geo_point_by_id(db, geo_point_id)
    if not geo_point:
        raise NotFoundException("Geo point not found")

    # Get period to check project access
    result = await db.execute(select(Period).where(Period.id == geo_point.period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has access to the related project
    has_access = await check_project_access(db, period.project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this geo point",
        )

    # Get images for the geo point
    images = await get_geo_point_images(db, geo_point_id)
    return images


@router.delete(
    "/geo-points/{geo_point_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_geo_point_image_endpoint(
    geo_point_id: UUID,
    image_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Delete an image for a geo point.
    """
    # Get geo point
    geo_point = await get_geo_point_by_id(db, geo_point_id)
    if not geo_point:
        raise NotFoundException("Geo point not found")

    # Get period to check project access
    result = await db.execute(select(Period).where(Period.id == geo_point.period_id))
    period = result.scalars().first()

    if not period:
        raise NotFoundException("Period not found")

    # Check if user has edit access to the related project
    has_edit_access = await check_project_edit_access(
        db, period.project_id, current_user
    )
    if not has_edit_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete images for this geo point",
        )

    # Delete the image
    await delete_geo_point_image(db, image_id)
