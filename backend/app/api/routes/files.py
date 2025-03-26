import os
from typing import Optional
from uuid import UUID

from fastapi import (
    APIRouter,
    File as FastAPIFile,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import select, func

from app.api.deps import CurrentUser, DbSession
from app.api.routes.projects import check_project_access, check_project_edit_access
from app.core.config import settings
from app.core.exceptions import NotFoundException, FileUploadException
from app.db.models.file import File
from app.db.models.period import Period
from app.models.file import (
    File as FileSchema,
    PaginatedFiles,
)
from app.utils.file_utils import (
    create_upload_dir,
    delete_file,
    get_content_type,
    save_upload_file,
)

router = APIRouter(tags=["files"])

print(settings)


@router.get("/files", response_model=PaginatedFiles)
async def get_files(
    db: DbSession,
    current_user: CurrentUser,
    project_id: Optional[UUID] = None,
    period_id: Optional[UUID] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
):
    """
    Retrieve files with optional filtering.
    """
    # Base query
    query = select(File)

    # Apply filters
    if project_id:
        # Check if user has access to this project
        has_access = await check_project_access(db, project_id, current_user)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this project",
            )
        query = query.where(File.project_id == project_id)

    if period_id:
        # Get the period to check project access
        period_result = await db.execute(select(Period).where(Period.id == period_id))
        period = period_result.scalars().first()

        if not period:
            raise NotFoundException("Period not found")

        # Check if user has access to the related project
        has_access = await check_project_access(db, period.project_id, current_user)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this period",
            )

        query = query.where(File.period_id == period_id)

    if category:
        query = query.where(File.category == category)

    # Get total count for pagination
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total = result.scalar_one()

    # Get paginated results
    query = query.order_by(File.upload_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    files = result.scalars().all()

    return {
        "items": files,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "page_size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1,
    }


@router.post("/files", response_model=FileSchema, status_code=status.HTTP_201_CREATED)
async def upload_file(
    db: DbSession,
    current_user: CurrentUser,
    file: UploadFile = FastAPIFile(...),
    project_id: Optional[UUID] = Form(None),
    period_id: Optional[UUID] = Form(None),
    category: str = Form(...),
):
    """
    Upload a file.
    """
    # Validate required parameters
    if not project_id and not period_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either project_id or period_id must be provided",
        )

    # If period_id is provided, get the related project_id
    if period_id:
        period_result = await db.execute(select(Period).where(Period.id == period_id))
        period = period_result.scalars().first()

        if not period:
            raise NotFoundException("Period not found")

        # Set project_id from period if not provided
        if not project_id:
            project_id = period.project_id

    # Check if user has edit access to the project
    has_access = await check_project_edit_access(db, project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to upload files to this project",
        )

    # Validate file category
    valid_categories = ["map", "image", "document", "analysis"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}",
        )

    try:
        # Create upload directory
        upload_dir = create_upload_dir(str(project_id))

        # Save file
        file_path, file_size = await save_upload_file(file, upload_dir)

        # Get content type
        content_type = get_content_type(file.filename)

        # Create file record in database
        db_file = File(
            name=file.filename,
            path=file_path,
            size=file_size,
            content_type=content_type,
            category=category,
            project_id=project_id,
            period_id=period_id,
            uploaded_by=current_user.id,
        )

        db.add(db_file)
        await db.commit()
        await db.refresh(db_file)

        return db_file

    except Exception as e:
        # Clean up any created files in case of error
        if "file_path" in locals():
            delete_file(file_path)

        raise FileUploadException(f"Error uploading file: {str(e)}")


@router.get("/files/{file_id}", response_model=FileSchema)
async def get_file(
    file_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Get file details by ID.
    """
    # Get file
    result = await db.execute(select(File).where(File.id == file_id))
    file = result.scalars().first()

    if not file:
        raise NotFoundException("File not found")

    # Check if user has access to the related project
    has_access = await check_project_access(db, file.project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this file",
        )

    return file


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file_endpoint(
    file_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Delete a file.
    """
    # Get file
    result = await db.execute(select(File).where(File.id == file_id))
    file = result.scalars().first()

    if not file:
        raise NotFoundException("File not found")

    # Check if user has edit access to the related project
    has_access = await check_project_edit_access(db, file.project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this file",
        )

    # Delete the physical file
    file_path = file.path
    if os.path.exists(file_path):
        os.remove(file_path)

    # Delete the database record
    await db.delete(file)
    await db.commit()


@router.get("/files/{file_id}/download")
async def download_file(
    file_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Download a file.
    """
    # Get file
    result = await db.execute(select(File).where(File.id == file_id))
    file = result.scalars().first()

    if not file:
        raise NotFoundException("File not found")

    # Check if user has access to the related project
    has_access = await check_project_access(db, file.project_id, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this file",
        )

    # Check if file exists
    if not os.path.exists(file.path):
        raise NotFoundException("File not found on disk")

    # Return file for download
    return FileResponse(
        path=file.path, filename=file.name, media_type=file.content_type
    )
