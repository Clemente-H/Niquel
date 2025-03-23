from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title="Project Manager API",
    description="API for Niquel's project management",
    version="0.1.0",
)

# Config CORS
origins = [
    "http://localhost:3000",  # Frontend local development  
    "http://localhost:5173",  # Vite dev server
    "http://frontend:3000",   # Frontend Docker
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include from API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to the Niquel's API"}