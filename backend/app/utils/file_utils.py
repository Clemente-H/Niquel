import os
import uuid
from typing import List, Optional, Tuple

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


def get_file_extension(filename: str) -> str:
    """Get the file extension from a filename."""
    return os.path.splitext(filename)[1].lower()


def create_upload_dir(project_id: Optional[str] = None) -> str:
    """
    Create a directory for file uploads.

    Args:
        project_id: Optional project ID to organize files

    Returns:
        str: Path to the upload directory
    """
    # Base upload directory
    upload_dir = settings.UPLOAD_DIR

    # Create base directory if it doesn't exist
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    # Create a unique folder for this upload
    file_id = str(uuid.uuid4())

    # If project_id is provided, create a subfolder for the project
    if project_id:
        upload_path = os.path.join(upload_dir, str(project_id), file_id)
    else:
        upload_path = os.path.join(upload_dir, file_id)

    # Create the directory
    os.makedirs(upload_path, exist_ok=True)

    return upload_path


async def save_upload_file(
    upload_file: UploadFile,
    upload_dir: str,
) -> Tuple[str, int]:
    """
    Save an uploaded file to the specified directory.

    Args:
        upload_file: The file to save
        upload_dir: Directory to save the file in

    Returns:
        Tuple[str, int]: Path to the saved file and file size
    """
    # Validate file size
    content = await upload_file.read()
    file_size = len(content)

    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"""File too large. Maximum size is
            {settings.MAX_UPLOAD_SIZE / (1024 * 1024):.1f} MB""",
        )

    # Create file path
    file_path = os.path.join(upload_dir, upload_file.filename)

    # Write file
    with open(file_path, "wb") as f:
        f.write(content)

    return file_path, file_size


def validate_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """
    Validate that the file has an allowed extension.

    Args:
        filename: Name of the file
        allowed_extensions: List of allowed extensions

    Returns:
        bool: True if file type is allowed, False otherwise
    """
    extension = get_file_extension(filename)
    return extension in allowed_extensions


def get_content_type(filename: str) -> str:
    """
    Get the content type based on file extension.

    Args:
        filename: Name of the file

    Returns:
        str: Content type for the file
    """
    extension = get_file_extension(filename)

    # Common content types
    content_types = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".csv": "text/csv",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls": "application/vnd.ms-excel",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".txt": "text/plain",
        ".kml": "application/vnd.google-earth.kml+xml",
        ".geojson": "application/geo+json",
    }

    return content_types.get(extension, "application/octet-stream")


def delete_file(file_path: str) -> bool:
    """
    Delete a file from the filesystem.

    Args:
        file_path: Path to the file

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
        return True
    except Exception:
        return False
