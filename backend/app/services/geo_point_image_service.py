from typing import List, Optional
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, FileUploadException
from app.db.models.geo_point import GeoPoint
from app.db.models.geo_point_image import GeoPointImage
from app.utils.file_utils import (
    create_upload_dir,
    delete_file,
    get_content_type,
    save_upload_file,
)


async def get_geo_point_image_by_id(
    db: AsyncSession, image_id: UUID
) -> Optional[GeoPointImage]:
    """
    Get a geo point image by ID.

    Args:
        db: Database session
        image_id: Image ID

    Returns:
        Optional[GeoPointImage]: Geo point image if found, None otherwise
    """
    result = await db.execute(select(GeoPointImage).where(GeoPointImage.id == image_id))
    return result.scalars().first()


async def get_geo_point_images(
    db: AsyncSession,
    geo_point_id: UUID,
    skip: int = 0,
    limit: int = 100,
) -> List[GeoPointImage]:
    """
    Get images for a geo point.

    Args:
        db: Database session
        geo_point_id: Geo point ID
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[GeoPointImage]: List of geo point images
    """
    query = select(GeoPointImage).where(GeoPointImage.geo_point_id == geo_point_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all()


async def get_geo_point_images_count(
    db: AsyncSession,
    geo_point_id: UUID,
) -> int:
    """
    Get count of images for a geo point.

    Args:
        db: Database session
        geo_point_id: Geo point ID

    Returns:
        int: Count of geo point images
    """
    query = select(func.count(GeoPointImage.id)).where(
        GeoPointImage.geo_point_id == geo_point_id
    )
    result = await db.execute(query)
    return result.scalar_one()


async def upload_geo_point_image(
    db: AsyncSession,
    upload_file: UploadFile,
    geo_point_id: UUID,
    user_id: UUID,
) -> GeoPointImage:
    """
    Upload an image for a geo point.

    Args:
        db: Database session
        upload_file: File to upload
        geo_point_id: Geo point ID
        user_id: User ID of uploader

    Returns:
        GeoPointImage: Created geo point image

    Raises:
        NotFoundException: If geo point not found
        FileUploadException: If upload fails
    """
    # Check if geo point exists
    result = await db.execute(select(GeoPoint).where(GeoPoint.id == geo_point_id))
    geo_point = result.scalars().first()
    if not geo_point:
        raise NotFoundException("Geo point not found")

    try:
        # Create upload directory
        upload_dir = create_upload_dir(f"geopoints/{geo_point_id}")

        # Save file
        file_path, file_size = await save_upload_file(upload_file, upload_dir)

        # Get content type
        content_type = get_content_type(upload_file.filename)

        # Create geo point image record
        geo_point_image = GeoPointImage(
            file_name=upload_file.filename,
            path=file_path,
            size=file_size,
            content_type=content_type,
            geo_point_id=geo_point_id,
            uploaded_by=user_id,
        )

        db.add(geo_point_image)
        await db.commit()
        await db.refresh(geo_point_image)

        return geo_point_image

    except Exception as e:
        # Clean up any created files in case of error
        if "file_path" in locals():
            delete_file(file_path)

        raise FileUploadException(f"Error uploading geo point image: {str(e)}")


async def delete_geo_point_image(db: AsyncSession, image_id: UUID) -> bool:
    """
    Delete a geo point image.

    Args:
        db: Database session
        image_id: Image ID

    Returns:
        bool: True if image was deleted, False otherwise

    Raises:
        NotFoundException: If image not found
    """
    image = await get_geo_point_image_by_id(db, image_id)
    if not image:
        raise NotFoundException("Geo point image not found")

    # Delete physical file
    if hasattr(image, "path") and image.path:
        delete_file(image.path)

    # Delete database record
    await db.delete(image)
    await db.commit()

    return True
