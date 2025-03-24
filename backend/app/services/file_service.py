import os
from typing import List, Optional
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, FileUploadException
from app.db.models.file import File
from app.models.file import FileUpdate
from app.utils.file_utils import (
    create_upload_dir,
    delete_file,
    get_content_type,
    save_upload_file,
)


async def upload_file(
    db: AsyncSession,
    upload_file: UploadFile,
    category: str,
    project_id: Optional[UUID] = None,
    period_id: Optional[UUID] = None,
    user_id: UUID = None,
) -> File:
    """
    Upload a file and create a file record in the database.

    Args:
        db: Database session
        upload_file: File to upload
        category: File category
        project_id: Optional project ID
        period_id: Optional period ID
        user_id: User ID of uploader

    Returns:
        File: Created file record

    Raises:
        FileUploadException: If upload fails
    """
    try:
        # Create upload directory
        upload_dir = create_upload_dir(str(project_id) if project_id else None)

        # Save file
        file_path, file_size = await save_upload_file(upload_file, upload_dir)

        # Get content type
        content_type = get_content_type(upload_file.filename)

        # Create file record
        file = File(
            name=upload_file.filename,
            path=file_path,
            size=file_size,
            content_type=content_type,
            category=category,
            project_id=project_id,
            period_id=period_id,
            uploaded_by=user_id,
        )

        db.add(file)
        await db.commit()
        await db.refresh(file)

        return file

    except Exception as e:
        # Clean up any created files in case of error
        if "file_path" in locals():
            delete_file(file_path)

        raise FileUploadException(f"Error uploading file: {str(e)}")


async def get_file_by_id(db: AsyncSession, file_id: UUID) -> Optional[File]:
    """
    Get a file by ID.

    Args:
        db: Database session
        file_id: File ID

    Returns:
        Optional[File]: File if found, None otherwise
    """
    result = await db.execute(select(File).where(File.id == file_id))
    return result.scalars().first()


async def get_files(
    db: AsyncSession,
    project_id: Optional[UUID] = None,
    period_id: Optional[UUID] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[File]:
    """
    Get files with optional filtering.

    Args:
        db: Database session
        project_id: Optional project ID filter
        period_id: Optional period ID filter
        category: Optional category filter
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[File]: List of files
    """
    query = select(File)

    if project_id:
        query = query.where(File.project_id == project_id)

    if period_id:
        query = query.where(File.period_id == period_id)

    if category:
        query = query.where(File.category == category)

    query = query.order_by(File.upload_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all()


async def get_files_count(
    db: AsyncSession,
    project_id: Optional[UUID] = None,
    period_id: Optional[UUID] = None,
    category: Optional[str] = None,
) -> int:
    """
    Get count of files with optional filtering.

    Args:
        db: Database session
        project_id: Optional project ID filter
        period_id: Optional period ID filter
        category: Optional category filter

    Returns:
        int: Count of files
    """
    query = select(func.count(File.id))

    if project_id:
        query = query.where(File.project_id == project_id)

    if period_id:
        query = query.where(File.period_id == period_id)

    if category:
        query = query.where(File.category == category)

    result = await db.execute(query)
    return result.scalar_one()


async def update_file(db: AsyncSession, file_id: UUID, file_data: FileUpdate) -> File:
    """
    Update file metadata.

    Args:
        db: Database session
        file_id: File ID
        file_data: Updated file data

    Returns:
        File: Updated file

    Raises:
        NotFoundException: If file not found
    """
    file = await get_file_by_id(db, file_id)
    if not file:
        raise NotFoundException("File not found")

    # Update fields
    for field, value in file_data.dict(exclude_unset=True).items():
        setattr(file, field, value)

    await db.commit()
    await db.refresh(file)

    return file


async def delete_file_record(db: AsyncSession, file_id: UUID) -> bool:
    """
    Delete a file record and the associated file.

    Args:
        db: Database session
        file_id: File ID

    Returns:
        bool: True if file was deleted, False otherwise

    Raises:
        NotFoundException: If file not found
    """
    file = await get_file_by_id(db, file_id)
    if not file:
        raise NotFoundException("File not found")

    # Delete the physical file
    if os.path.exists(file.path):
        os.remove(file.path)

    # Delete the database record
    await db.delete(file)
    await db.commit()

    return True
