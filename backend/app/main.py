from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.routes import (
    auth,
    users,
    projects,
    periods,
    files,
    assignments,
    geo_points,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Niquel API",
    description="Backend API for Niquel Project Management System",
    version="0.1.0",
)

# Configure CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Development mode - allow all origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API routes
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}")
app.include_router(users.router, prefix=f"{settings.API_V1_STR}")
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}")
app.include_router(periods.router, prefix=f"{settings.API_V1_STR}")
app.include_router(files.router, prefix=f"{settings.API_V1_STR}")
app.include_router(assignments.router, prefix=f"{settings.API_V1_STR}")
app.include_router(geo_points.router, prefix=f"{settings.API_V1_STR}")


@app.get("/")
async def root():
    return {"message": "Welcome to Niquel API", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "api_version": "v1",
    }


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting Niquel API in {settings.ENVIRONMENT} mode")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Niquel API")
