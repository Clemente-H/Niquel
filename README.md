# Niquel - Project Management System

A comprehensive web-based project management system with role-based access control.

## Key Features

- **Authentication System**: Email/password login (with future Google integration)
- **User Management**: 3 different roles (Admin, Manager, Regular)
- **Project Management**: Track project status and historical changes
- **User Assignment**: Control project access based on assignments
- **File Management**: Associate files with projects
- **Period Management**: Control different time periods within each project

## User Roles

- **Admin**: Full system control, access to all projects and users
- **Manager**: Regular user management and project assignment capabilities
- **Regular**: Limited access to assigned projects only

## Technology Stack

### Backend
- Python with FastAPI
- PostgreSQL database
- JWT authentication
- Alembic for database migrations

### Frontend
- React 18 with TypeScript
- Vite as bundler
- TailwindCSS for styling
- Material-UI components
- Context API for state management
- React Router for routing
- Lucide React for icons
- Axios for API calls

### DevOps
- Docker and Docker Compose for containerization
- Volumes for data persistence

## Project Structure

### Full Stack Structure
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
├── frontend/                 # React with TypeScript and Vite
│   ├── public/               # Static public assets
│   ├── src/
│   │   ├── assets/           # Static assets (images, icons, etc.)
│   │   ├── components/       # Reusable components
│   │   │   ├── common/       # Generic components (Button, Card, etc.)
│   │   │   └── layout/       # Layout components (Sidebar, Header, Footer)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components by route
│   │   │   ├── auth/         # Authentication pages (Login, Register)
│   │   │   ├── dashboard/    # Dashboard pages
│   │   │   ├── projects/     # Project management pages
│   │   │   └── admin/        # Admin pages (User Management)
│   │   ├── services/         # API services
│   │   ├── store/            # State management
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Root component
│   │   ├── index.tsx         # Entry point
│   │   ├── routes.tsx        # Route configuration
│   │   └── index.css         # Global styles
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── tsconfig.json         # TypeScript configuration
│   ├── vite.config.ts        # Vite configuration
│   ├── postcss.config.js     # PostCSS configuration
│   ├── Dockerfile
│   └── package.json          # Dependencies and scripts
├── docker-compose.yml
└── README.md
```

## Current Status

### Completed Phases
- [x] Phase 0: Planning and initial structure
- [x] Phase 1: Project initialization and frontend architecture
  - [x] Create directory structure
  - [x] Initialize backend environment
  - [x] Initialize frontend with Vite, React, and TypeScript
  - [x] Install basic dependencies
  - [x] Complete environment setup
- [x] Phase 2: Environment setup with TypeScript and Tailwind
- [x] Phase 3: Application type definitions
- [x] Phase 4: Layout components implementation
  - [x] Main dashboard layout (DashboardLayout)
  - [x] Authentication layout (AuthLayout)
  - [x] Header, sidebar, and footer components
- [x] Phase 5: Common components implementation
  - [x] Button component with variants
  - [x] Card component for content
  - [x] Status indicator with badges
- [x] Phase 6: Basic routing implementation
  - [x] React Router configuration
  - [x] Role-based route protection
- [x] Phase 7: Initial pages development
  - [x] Login page
  - [x] Register page
  - [x] Dashboard with project listing
- [x] Phase 8: Project management pages
  - [x] Project list with filtering
  - [x] Project details page
  - [x] Project form for creation/editing
- [x] Phase 9: User management page
  - [x] User listing with filtering
  - [x] User creation/editing form
  - [x] Role-based access control

### Current Phase
- [ ] Phase 10: State management implementation
  - [ ] API service integration
  - [ ] Auth context for user sessions
  - [ ] Form validation and error handling

### Next Phases
- [ ] Phase 11: Authentication and User Management (Backend)
- [ ] Phase 12: Project Management (Backend)
- [ ] Phase 13: Assignment System (Backend)
- [ ] Phase 14: File Management (Backend)
- [ ] Phase 15: Period management components (Frontend)
- [ ] Phase 16: File upload integration (Frontend)
- [ ] Phase 17: Visualization components (Frontend)
- [ ] Phase 18: Backend integration and testing
  - [ ] Connect to API endpoints
  - [ ] Error handling and loading states
  - [ ] End-to-end testing
- [ ] Phase 19: Enhancements and Additional Features

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 16+
- Docker and Docker Compose (optional)
- Git
- npm or yarn

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
- Frontend will be available at: http://localhost:5173
- API will be available at: http://localhost:8000

## Database Migrations

To initialize the database and run migrations:

```bash
cd backend
alembic revision --autogenerate -m "Initial database setup"
alembic upgrade head
```

## Test Data
For testing the login:
- Email: admin@example.com
- Password: password

## TypeScript Migration
The project has been migrated from JavaScript (JSX) to TypeScript (TSX) for improved type safety and developer experience. This change provides:

- Static type checking
- Better IDE support with autocompletion
- Improved code documentation through interfaces and types
- Early detection of common errors

## Code Conventions

- Components in PascalCase
- TypeScript interfaces prefixed with 'I' (e.g., IUser)
- Custom hooks with "use" prefix
- Service functions in camelCase
- Component and page files with .tsx extension
- Utility files with .ts extension

## Implemented Features

1. **Authentication System**: Login and registration with role-based access
2. **Dashboard Interface**: Overview of all projects with filtering options
3. **Project Management**: Create, view, and edit projects
4. **User Management**: Admin interface for managing system users
5. **Role-Based Access Control**: Different permissions by user role
6. **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Development Notes

- We chose Vite instead of Create React App for better development performance
- File structure follows feature-based organization for easier maintenance
- The project uses Material-UI and Tailwind CSS for consistent UI components
- Context API is used for state management instead of Redux for simplicity
- TypeScript is used throughout the frontend for type safety
- The frontend currently uses mocked data for development, pending integration with a real API
- All forms include validation and loading states to improve UX
- The project is structured to easily integrate with a backend API in future phases
- Route protection is implemented based on user roles
