# Niquel - Backend API

Python FastAPI backend para el Niquel Project Management System con role-based access control.

## Features

- **Authentication System**: Secure JWT-based authentication
- **User Management**: Role-based user system (Admin, Manager, Regular)
- **Project Management**: CRUD operations for water resource projects
- **Period Management**: Track different time periods for projects
- **File Management**: Store and serve project-related files
- **Assignment System**: Control project access based on user assignments
- **API Documentation**: Auto-generated Swagger documentation

## Tech Stack

- **Python 3.11+**: Modern Python features
- **FastAPI**: High-performance API framework
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database interactions
- **Alembic**: Database migration tool
- **Pydantic**: Data validation and settings management
- **JWT**: JSON Web Tokens for authentication
- **pytest**: Testing framework
- **Docker**: Containerization

## Project Structure

```
backend/
├── app/                    # Main application package
│   ├── api/                # API endpoints
│   │   ├── __init__.py
│   │   ├── deps.py         # Dependencies (auth, db session)
│   │   ├── routes/         # Route modules
│   │   │   ├── __init__.py
│   │   │   ├── auth.py     # Authentication endpoints
│   │   │   ├── users.py    # User management
│   │   │   ├── projects.py # Project management
│   │   │   ├── periods.py  # Period management
│   │   │   ├── files.py    # File management
│   │   │   └── assignments.py # User-project assignments
│   ├── core/               # Core application code
│   │   ├── __init__.py
│   │   ├── config.py       # App configuration
│   │   ├── security.py     # Password hashing, JWT handling
│   │   └── exceptions.py   # Custom exceptions
│   ├── db/                 # Database related code
│   │   ├── __init__.py
│   │   ├── base.py         # Base SQLAlchemy model
│   │   ├── session.py      # DB session management
│   │   └── models/         # SQLAlchemy models
│   │       ├── __init__.py
│   │       ├── user.py
│   │       ├── project.py
│   │       ├── period.py
│   │       ├── file.py
│   │       └── assignment.py
│   ├── models/             # Pydantic models (schemas)
│   │   ├── __init__.py
│   │   ├── base.py         # Base schemas
│   │   ├── token.py        # Auth token schemas
│   │   ├── user.py         # User schemas
│   │   ├── project.py      # Project schemas
│   │   ├── period.py       # Period schemas
│   │   ├── file.py         # File schemas
│   │   └── assignment.py   # Assignment schemas
│   ├── services/           # Business logic layer
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── project_service.py
│   │   ├── period_service.py
│   │   ├── file_service.py
│   │   └── assignment_service.py
│   ├── utils/              # Utility functions
│   │   ├── __init__.py
│   │   ├── file_utils.py
│   │   └── date_utils.py
│   ├── __init__.py
│   └── main.py             # FastAPI application entry point
├── alembic/                # Database migrations
│   ├── versions/           # Migration scripts
│   ├── env.py              # Alembic environment
│   ├── script.py.mako      # Migration script template
│   └── alembic.ini         # Alembic configuration
├── data/                   # Data directory (not in git)
│   └── uploads/            # Uploaded files
├── tests/                  # Test directory
│   ├── __init__.py
│   ├── conftest.py         # Test configuration and fixtures
│   ├── test_api/           # API tests
│   ├── test_services/      # Service layer tests
│   └── test_models/        # Model tests
├── scripts/                # Utility scripts
│   ├── seed_data.py        # Database seeder
│   └── init_project.sh     # Project initialization script
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── pyproject.toml          # Project metadata and dependencies
├── Dockerfile              # Docker configuration
├── requirements.txt        # Python dependencies
└── README.md               # This file
```

## Data Models

### User
- id: UUID (primary key)
- email: String (unique)
- hashed_password: String
- name: String
- role: Enum (admin, manager, regular)
- is_active: Boolean
- created_at: DateTime
- updated_at: DateTime

### Project
- id: UUID (primary key)
- name: String
- description: Text
- location: String
- type: Enum (Hidrología, Conservación, Monitoreo, Análisis, Restauración)
- status: Enum (Planificación, En progreso, En revisión, Completado)
- owner_id: UUID (foreign key to User)
- start_date: Date
- created_at: DateTime
- updated_at: DateTime

### Period
- id: UUID (primary key)
- project_id: UUID (foreign key to Project)
- name: String
- start_date: Date
- end_date: Date
- volume: Float (optional)
- start_time: Time (optional)
- width: Float (optional)
- max_depth: Float (optional)
- notes: Text (optional)
- created_at: DateTime
- updated_at: DateTime
- created_by: UUID (foreign key to User)

### File
- id: UUID (primary key)
- name: String
- path: String
- size: Integer
- content_type: String
- category: Enum (map, image, document, analysis)
- project_id: UUID (foreign key to Project, optional)
- period_id: UUID (foreign key to Period, optional)
- uploaded_by: UUID (foreign key to User)
- upload_date: DateTime

### UserAssignment
- id: UUID (primary key)
- user_id: UUID (foreign key to User)
- project_id: UUID (foreign key to Project)
- role: Enum (viewer, editor, admin)
- assigned_at: DateTime
- assigned_by: UUID (foreign key to User)

## API Endpoints

### Authentication
- POST /api/auth/login: User login
- POST /api/auth/logout: User logout
- POST /api/auth/register: User registration
- POST /api/auth/password-recovery/{email}: Password recovery
- POST /api/auth/reset-password: Reset password with token

### Users
- GET /api/users/: Get all users (admin)
- POST /api/users/: Create new user (admin)
- GET /api/users/me: Get current user
- GET /api/users/{id}: Get user by ID
- PUT /api/users/{id}: Update user
- DELETE /api/users/{id}: Delete user (admin)

### Projects
- GET /api/projects/: Get all accessible projects
- POST /api/projects/: Create new project
- GET /api/projects/{id}: Get project details
- PUT /api/projects/{id}: Update project
- DELETE /api/projects/{id}: Delete project
- GET /api/projects/{id}/assignments: Get project assignments
- POST /api/projects/{id}/assignments: Add user to project

### Periods
- GET /api/projects/{id}/periods/: Get all periods for a project
- POST /api/projects/{id}/periods/: Create new period
- GET /api/periods/{id}: Get period details
- PUT /api/periods/{id}: Update period
- DELETE /api/periods/{id}: Delete period

### Files
- GET /api/files/: Get all files (filtered)
- POST /api/files/: Upload file
- GET /api/files/{id}: Get file details
- GET /api/files/{id}/download: Download file
- DELETE /api/files/{id}: Delete file
- GET /api/projects/{id}/files: Get project files
- GET /api/periods/{id}/files: Get period files

## Setup and Installation

### Prerequisites
- Python 3.11+
- PostgreSQL
- pip
- virtualenv (recommended)

### Local Development Setup
```bash
# Clone the repository
git clone <repository_url>
cd niquel/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials and other settings

# Create database
createdb niquel  # Or use your preferred PostgreSQL management tool

# Run migrations
alembic upgrade head

# Seed the database with sample data (optional)
python scripts/seed_data.py

# Start the development server
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### Docker Setup
```bash
docker build -t niquel-backend .
docker run -p 8000:8000 --env-file .env niquel-backend
```

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Revert migrations
alembic downgrade -1  # Revert one step
alembic downgrade base  # Revert all migrations
```

## Testing

```bash
# Run all tests
pytest

# Run specific tests
pytest tests/test_api/test_users.py
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development Roadmap

1. **Phase 1: Initial Setup** ✅
   - Project structure setup
   - Basic FastAPI configuration
   - Database connection setup
   - Alembic configuration

2. **Phase 2: Authentication System** ✅
   - User model definition
   - JWT implementation
   - Login/register endpoints (in progress)
   - Password hashing

3. **Phase 3: Core Data Models** ✅
   - Project model
   - Period model
   - File model
   - User assignment model

4. **Phase 4: Pydantic Schemas** ✅
   - Base schemas
   - User schemas
   - Project schemas
   - Period schemas
   - File schemas
   - Assignment schemas

5. **Phase 5: CRUD API Endpoints** 🔄
   - Authentication endpoints (auth.py)
   - User management endpoints (users.py)
   - Project management endpoints (projects.py)
   - Period management endpoints (periods.py)
   - File management endpoints (files.py)
   - Assignment endpoints (assignments.py)

6. **Phase 6: Business Logic Layer** 🔄
   - User service
   - Project service
   - Period service
   - File service
   - Assignment service
   - Role-based access control

7. **Phase 7: Testing** 🔄
   - Unit tests for models and services
   - Integration tests for API endpoints
   - Performance tests

8. **Phase 8: Documentation and Optimization** 🔄
   - API documentation completion
   - Code optimization
   - Performance improvements

## Progress Updates

### 2025-03-23: Database Models and Authentication System
- Implemented database models (User, Project, Period, File, UserAssignment)
- Created SQLAlchemy base class and relationships
- Implemented JWT authentication system (security.py)
- Created database session management
- Implemented exception handling classes
- Completed the seed_data.py script for generating test data
- Created API dependency system for authentication and permissions

### 2025-03-24: Pydantic Schemas Implementation
- Created base schema classes
- Implemented all Pydantic models for data validation and serialization
- Added validation for roles, types, and other enumerated values
- Created response models for pagination and detailed views
- Aligned models with frontend TypeScript interfaces

## Next Steps
- Implement authentication endpoints (login/register)
- Complete API endpoint implementation for all resources
- Implement service layer for business logic
- Create automated tests
- Finalize API documentation

## Contribution Guidelines

- Use Black for code formatting
- Follow PEP 8 guidelines
- Write tests for all new features
- Keep the API documentation up to date
