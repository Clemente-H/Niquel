#!/bin/bash

# Niquel Backend Project Initialization Script
# This script creates the folder structure and empty files for the backend project

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  Niquel Backend Initialization  ${NC}"
echo -e "${BLUE}====================================${NC}"

# Create main directories
echo -e "${YELLOW}Creating directory structure...${NC}"

# Main application directory
mkdir -p app/api/routes
mkdir -p app/core
mkdir -p app/db/models
mkdir -p app/models
mkdir -p app/services
mkdir -p app/utils

# Alembic directory for migrations
mkdir -p alembic/versions

# Test directories
mkdir -p tests/test_api
mkdir -p tests/test_services
mkdir -p tests/test_models

# Data directory for uploads (not included in git)
mkdir -p data/uploads

# Scripts directory
mkdir -p scripts

echo -e "${GREEN}Directory structure created successfully!${NC}"

# Create __init__.py files for Python modules
echo -e "${YELLOW}Creating Python module files...${NC}"

# Create empty __init__.py files in all directories
touch app/__init__.py
touch app/api/__init__.py
touch app/api/routes/__init__.py
touch app/core/__init__.py
touch app/db/__init__.py
touch app/db/models/__init__.py
touch app/models/__init__.py
touch app/services/__init__.py
touch app/utils/__init__.py
touch tests/__init__.py
touch tests/test_api/__init__.py
touch tests/test_services/__init__.py
touch tests/test_models/__init__.py

echo -e "${GREEN}Python module files created successfully!${NC}"

# Create main application files
echo -e "${YELLOW}Creating main application files...${NC}"

# API files
touch app/api/deps.py

# API route files
touch app/api/routes/auth.py
touch app/api/routes/users.py
touch app/api/routes/projects.py
touch app/api/routes/periods.py
touch app/api/routes/files.py
touch app/api/routes/assignments.py

# Core files
touch app/core/config.py
touch app/core/security.py
touch app/core/exceptions.py

# Database files
touch app/db/base.py
touch app/db/session.py

# Database model files
touch app/db/models/user.py
touch app/db/models/project.py
touch app/db/models/period.py
touch app/db/models/file.py
touch app/db/models/assignment.py

# Pydantic models (schemas)
touch app/models/user.py
touch app/models/project.py
touch app/models/period.py
touch app/models/file.py
touch app/models/assignment.py
touch app/models/token.py

# Service files
touch app/services/user_service.py
touch app/services/project_service.py
touch app/services/period_service.py
touch app/services/file_service.py
touch app/services/assignment_service.py

# Utility files
touch app/utils/file_utils.py
touch app/utils/date_utils.py

# Main application file
touch app/main.py

# Alembic files
touch alembic/env.py
touch alembic/script.py.mako
touch alembic.ini

# Test files
touch tests/conftest.py

# Docker and configuration files
touch Dockerfile
touch requirements.txt
touch .env.example
touch pyproject.toml

# Seed data script
touch scripts/seed_data.py

echo -e "${GREEN}Main application files created successfully!${NC}"

# Create .gitignore file
echo -e "${YELLOW}Creating .gitignore file...${NC}"

cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
env/
ENV/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Environment variables
.env

# Logs
*.log

# Data files (uploads, etc)
data/uploads/

# Tests
.coverage
htmlcov/
.pytest_cache/

# Alembic
alembic/versions/*_*.py
!alembic/versions/__init__.py

# OS
.DS_Store
Thumbs.db
EOF

echo -e "${GREEN}.gitignore file created successfully!${NC}"

# Create basic content for main.py
echo -e "${YELLOW}Creating basic content for main.py...${NC}"

cat > app/main.py << EOF
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Niquel API",
    description="Backend API for Niquel Project Management System",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Niquel API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
EOF

echo -e "${GREEN}Basic content for main.py created successfully!${NC}"

# Create basic content for .env.example
echo -e "${YELLOW}Creating .env.example file...${NC}"

cat > .env.example << EOF
# Database settings
DATABASE_URL=postgresql://postgres:postgres@localhost/niquel

# Security settings
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256

# General settings
ENVIRONMENT=development
DEBUG=True

# File storage
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_SIZE=20971520  # 20 MB in bytes
EOF

echo -e "${GREEN}.env.example file created successfully!${NC}"

# Create basic content for config.py
echo -e "${YELLOW}Creating basic content for config.py...${NC}"

cat > app/core/config.py << EOF
import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database settings
    DATABASE_URL: PostgresDsn

    # File storage
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024  # 20 MB in bytes

    # General settings
    ENVIRONMENT: str
    DEBUG: bool = False

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
EOF

echo -e "${GREEN}Basic content for config.py created successfully!${NC}"

# Create basic requirements.txt
echo -e "${YELLOW}Creating requirements.txt...${NC}"

cat > requirements.txt << EOF
# FastAPI and ASGI server
fastapi>=0.103.1
uvicorn>=0.23.2
python-multipart>=0.0.6

# Database
sqlalchemy>=2.0.20
alembic>=1.12.0
psycopg2-binary>=2.9.7
asyncpg>=0.28.0

# Authentication
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4

# Environment and validation
pydantic>=2.3.0
pydantic-settings>=2.0.3
python-dotenv>=1.0.0

# Utilities
email-validator>=2.0.0
python-dateutil>=2.8.2
tenacity>=8.2.3
httpx>=0.24.1

# Testing
pytest>=7.4.0
pytest-asyncio>=0.21.1
coverage>=7.3.1
EOF

echo -e "${GREEN}requirements.txt created successfully!${NC}"

# Create basic Dockerfile
echo -e "${YELLOW}Creating Dockerfile...${NC}"

cat > Dockerfile << EOF
FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create upload directory if it doesn't exist
RUN mkdir -p ./data/uploads

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

echo -e "${GREEN}Dockerfile created successfully!${NC}"

# Create pyproject.toml
echo -e "${YELLOW}Creating pyproject.toml...${NC}"

cat > pyproject.toml << EOF
[tool.black]
line-length = 88
target-version = ['py310']
include = '\.pyi?$'

[tool.isort]
profile = "black"
multi_line_output = 3

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
python_functions = "test_*"
python_classes = "Test*"

[tool.coverage.run]
source = ["app"]
omit = ["tests/*", "alembic/*"]
EOF

echo -e "${GREEN}pyproject.toml created successfully!${NC}"

echo -e "${BLUE}====================================${NC}"
echo -e "${GREEN}Niquel Backend Initialization Complete!${NC}"
echo -e "${BLUE}====================================${NC}"
echo
echo -e "Next steps:"
echo -e "1. Create a virtual environment: ${YELLOW}python -m venv venv${NC}"
echo -e "2. Activate it: ${YELLOW}source venv/bin/activate${NC} (Linux/Mac) or ${YELLOW}venv\\Scripts\\activate${NC} (Windows)"
echo -e "3. Install requirements: ${YELLOW}pip install -r requirements.txt${NC}"
echo -e "4. Create .env file: ${YELLOW}cp .env.example .env${NC} (then edit with your settings)"
echo -e "5. Setup the database and run migrations"
echo -e "6. Run the server: ${YELLOW}uvicorn app.main:app --reload${NC}"
echo
echo -e "For more information, check the README.md file."
echo -e "${BLUE}====================================${NC}"
