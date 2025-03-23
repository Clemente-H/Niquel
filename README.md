# Niquel - Project Management System

A web-based project management system with role-based access control.

## Key Features

- **Authentication System**: Basic email/password login (with future Google integration)
- **User Management**: 3 different roles (Admin, Manager, Regular)
- **Project Management**: Track project status and historical changes
- **User Assignment**: Control project access based on assignments
- **File Management**: Associate files with projects

## User Roles

- **Admin**: Full system control, access to all projects and users
- **Manager**: Regular user management and project assignment capabilities
- **Regular**: Limited access to assigned projects only

## Technology Stack

### Backend
- Python with FastAPI
- PostgreSQL database
- JWT authentication

### Frontend
- React + Vite + Typescript
- Material-UI components
- Context API for state management

### DevOps
- Docker and Docker Compose for containerization
- Volumes for data persistence

## Project Structure

```
project-manager/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core configuration
│   │   ├── db/               # Database models and connection
│   │   ├── models/           # Pydantic models
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   ├── alembic/              # Database migrations
│   ├── Dockerfile
│   ├── requirements.txt
│   └── venv/                 # Virtual environment (not in Git)
├── frontend/                 # React with Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # Context API
│   │   ├── pages/            # Main pages
│   │   ├── services/         # API services
│   │   └── utils/            # Utilities
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## Current Status

### Current Phase
- [x] Phase 0: Planning and initial structure
- [x] Phase 1: Project initialization
  - [x] Create directory structure
  - [x] Initialize backend environment
  - [x] Initialize frontend with Vite and React
  - [x] Install basic dependencies
  - [x] Complete environment setup
- [ ] Phase 2: Authentication and User Management
- [ ] Phase 3: Project Management
- [ ] Phase 4: Assignment System
- [ ] Phase 5: File Management
- [ ] Phase 6: Enhancements and Additional Features

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 16+
- Docker and Docker Compose (optional)
- Git

### Manual Installation (Development)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Installation
```bash
docker-compose up -d
```
- Frontend will be available at: http://localhost:3000
- API will be available at: http://localhost:8000

## Database Migrations

To initialize the database and run migrations:

```bash
cd backend
alembic revision --autogenerate -m "Initial database setup"
alembic upgrade head
```

## TypeScript Migration
The project has been migrated from JavaScript (JSX) to TypeScript (TSX) for improved type safety and developer experience. This change provides:

- Static type checking
- Better IDE support with autocompletion
- Improved code documentation through interfaces and types
- Early detection of common errors

## Next Steps
- Implement authentication system in Phase 2
- Create user management interfaces
- Develop project management features

## Development Notes
- We chose Vite instead of Create React App for better development performance
- File structure follows feature-based organization for easier maintenance
- The project uses Material-UI for consistent UI components
- Context API is used for state management instead of Redux for simplicity
- TypeScript is used throughout the frontend for type safety