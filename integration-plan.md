# Niquel - Project Management System

A comprehensive web-based project management system with role-based access control, specialized for water resource projects.

## Current Status

The project is now at an integration phase:

- ✅ The **Frontend** is fully implemented with UI components and mock data
- ✅ The **Backend** API is fully implemented with authentication, CRUD operations, and business logic
- ⏳ Integration between Frontend and Backend is now needed

## Backend-Frontend Integration Plan

### 1. API Client Setup

- [x] Create reusable API client with Axios
- [x] Add authentication header interceptors
- [x] Set up error handling and response formatting
- [x] Configure environment variables

**Files to implement/modify:**
- `frontend/src/services/apiClient.ts`
- `frontend/src/.env` (create file for environment variables)

### 2. Authentication Integration

- [ ] Update login/register to use real API endpoints
- [ ] Implement JWT token storage in localStorage/sessionStorage
- [ ] Set up auth context provider for global state
- [ ] Add token refresh mechanism
- [ ] Update protected routes to use real authentication

**Files to implement/modify:**
- `frontend/src/services/authService.ts`
- `frontend/src/store/slices/authSlice.ts` or create auth context
- `frontend/src/components/common/ProtectedRoute.tsx`
- `frontend/src/pages/auth/Login.tsx`
- `frontend/src/pages/auth/Register.tsx`

### 3. Core Services Implementation

- [ ] Implement userService for user management
- [ ] Implement projectService for project operations
- [ ] Create periodService for period management
- [ ] Add fileService for file operations
- [ ] Implement assignmentService for user-project assignments

**Files to implement/modify:**
- `frontend/src/services/userService.ts`
- `frontend/src/services/projectService.ts`
- `frontend/src/services/periodService.ts`
- `frontend/src/services/fileService.ts`
- `frontend/src/services/assignmentService.ts`

### 4. Dashboard and Project Views

- [ ] Update Dashboard to fetch projects from API
- [ ] Implement ProjectList with real data and filtering
- [ ] Connect ProjectDetail to load project data and periods
- [ ] Update ProjectForm to create/edit real projects
- [ ] Add file upload/download functionality

**Files to implement/modify:**
- `frontend/src/pages/dashboard/Dashboard.tsx`
- `frontend/src/pages/projects/ProjectList.tsx`
- `frontend/src/pages/projects/ProjectDetail.tsx`
- `frontend/src/pages/projects/ProjectForm.tsx`
- `frontend/src/components/common/FileUploader.tsx`

### 5. User Management and Admin Features

- [ ] Connect UserManagement page to the API
- [ ] Implement user creation and editing
- [ ] Set up role-based permissions throughout the app
- [ ] Add project assignment functionality

**Files to implement/modify:**
- `frontend/src/pages/admin/UserManagement.tsx`
- `frontend/src/components/common/Table.tsx` (for reusable data tables)

### 6. Period Management and Visualization

- [ ] Implement period creation and editing
- [ ] Connect visualization components to real data
- [ ] Add data analysis features

**Files to implement/modify:**
- Create new components for period management
- Update visualization components with real data

### 7. Testing and Polishing

- [ ] Test all API integrations
- [ ] Ensure proper error handling throughout the app
- [ ] Add loading states to improve UX
- [ ] Fix any data format inconsistencies

## API Endpoints Reference

The backend provides the following endpoints (available at `/api`):

### Authentication
- `POST /api/auth/token`: User login
- `POST /api/auth/register`: User registration

### Users
- `GET /api/users/`: Get all users (admin)
- `POST /api/users/`: Create new user (admin)
- `GET /api/users/me`: Get current user
- `GET /api/users/{id}`: Get user by ID
- `PUT /api/users/{id}`: Update user
- `DELETE /api/users/{id}`: Delete user (admin)

### Projects
- `GET /api/projects/`: Get all accessible projects
- `POST /api/projects/`: Create new project
- `GET /api/projects/{id}`: Get project details
- `PUT /api/projects/{id}`: Update project
- `DELETE /api/projects/{id}`: Delete project

### Periods
- `GET /api/projects/{id}/periods/`: Get all periods for a project
- `POST /api/projects/{id}/periods/`: Create new period
- `GET /api/periods/{id}`: Get period details
- `PUT /api/periods/{id}`: Update period
- `DELETE /api/periods/{id}`: Delete period

### Files
- `GET /api/files/`: Get all files (filtered)
- `POST /api/files/`: Upload file
- `GET /api/files/{id}`: Get file details
- `GET /api/files/{id}/download`: Download file
- `DELETE /api/files/{id}`: Delete file

### Assignments
- `GET /api/projects/{id}/assignments`: Get project assignments
- `POST /api/projects/{id}/assignments`: Add user to project
- `POST /api/projects/{id}/batch-assign`: Assign multiple users to project
- `PUT /api/assignments/{id}`: Update user assignment
- `DELETE /api/assignments/{id}`: Remove user from project

## Authentication Flow

1. User logs in with email/password
2. Backend returns JWT token
3. Frontend stores token in localStorage/sessionStorage
4. API requests include the token in the Authorization header
5. Protected routes check for valid token

## Data Model Alignment

The frontend and backend data models should be aligned. The backend uses snake_case for field names, while the frontend uses camelCase. The integration should handle this conversion automatically in the API client.

The key models to align are:
- User
- Project
- Period
- File
- UserAssignment

## Setup Instructions

### Prerequisites
- Node.js 16+
- Python 3.11+
- PostgreSQL
- Docker (optional)

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy the .env.example file to .env and configure it:
   ```bash
   cp .env.example .env
   ```

5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   # Or use: make dev
   ```

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
