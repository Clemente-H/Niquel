from fastapi import APIRouter

from app.api.endpoints import health

api_router = APIRouter()

# Include endpoints rutes
api_router.include_router(health.router, prefix="/health", tags=["health"])

# Here more routers will be included as they are developed:
# api_router.include_router(
# users.router,
# prefix="/users",
# tags=["users"])
# api_router.include_router(
#     auth.router,
#     prefix="/auth",
#     tags=["auth"])
# api_router.include_router(
#     projects.router,
#     prefix="/projects",
#     tags=["projects"])
# api_router.include_router(
#     files.router,
#     prefix="/files",
#     tags=["files"])
