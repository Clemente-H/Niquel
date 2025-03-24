from fastapi import HTTPException, status


class NiquelException(Exception):
    """Base exception for all application-specific exceptions."""

    pass


class CredentialsException(HTTPException):
    """Exception for authentication errors."""

    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(HTTPException):
    """Exception for permission errors."""

    def __init__(self, detail: str = "Not enough permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class NotFoundException(HTTPException):
    """Exception for not found errors."""

    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )


class DuplicateResourceException(HTTPException):
    """Exception for duplicate resource errors."""

    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class InvalidOperationException(HTTPException):
    """Exception for invalid operations."""

    def __init__(self, detail: str = "Invalid operation"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )


class FileUploadException(HTTPException):
    """Exception for file upload errors."""

    def __init__(self, detail: str = "Error uploading file"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
