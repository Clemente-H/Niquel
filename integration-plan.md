# Niquel - Project Management System

A comprehensive web-based project management system with role-based access control, specialized for water resource projects.

## Current Status

The project is now at an integration phase:

- ✅ The **Frontend** is fully implemented with UI components and mock data
- ✅ The **Backend** API is fully implemented with authentication, CRUD operations, and business logic
- 🔄 Integration between Frontend and Backend is in progress

## Backend-Frontend Integration Plan

### 1. API Client Setup ✅

- [x] Create reusable API client with Axios
- [x] Add authentication header interceptors
- [x] Set up error handling and response formatting
- [x] Configure environment variables

**Implemented files:**
- `frontend/src/services/apiClient.ts`

### 2. Authentication Integration ✅

- [x] Update login/register to use real API endpoints
- [x] Implement JWT token storage in localStorage
- [x] Set up auth context provider for global state
- [x] Update protected routes to use real authentication
- [x] Implement logout functionality
- [x] Fix route protection to correctly redirect to login page

**Implemented files:**
- `frontend/src/services/authService.ts`
- `frontend/src/store/AuthContext.tsx`
- `frontend/src/components/common/ProtectedRoute.tsx`
- `frontend/src/pages/auth/Login.tsx`
- `frontend/src/pages/auth/Register.tsx`
- `frontend/src/components/layout/Header.tsx` (for logout functionality)
- `frontend/src/routes.tsx` (for protected routes)

### 3. Core Services Implementation ✅

- [x] Implement userService for user management
- [x] Implement projectService for project operations
- [x] Create periodService for period management
- [x] Add fileService for file operations
- [x] Implement assignmentService for user-project assignments

**Implemented files:**
- `frontend/src/services/userService.ts`
- `frontend/src/services/projectService.ts`
- `frontend/src/services/periodService.ts`
- `frontend/src/services/fileService.ts`
- `frontend/src/services/assignmentService.ts`
- `frontend/src/services/index.ts`

### 4. Dashboard and Project Views ✅

- [x] Update Dashboard to fetch projects from API
- [x] Implement ProjectList with real data and filtering
- [x] Connect ProjectDetail to load project data and periods
- [x] Update ProjectForm to create/edit real projects
- [x] Add file upload/download functionality

**Implemented/Updated files:**
- `frontend/src/pages/dashboard/Dashboard.tsx` ✅
- `frontend/src/pages/projects/ProjectList.tsx` ✅
- `frontend/src/pages/projects/ProjectDetail.tsx` ✅
- `frontend/src/pages/projects/ProjectForm.tsx` ✅
- `frontend/src/components/common/FileUploader.tsx` ✅

### 5. User Management and Admin Features ⏳

- [ ] Connect UserManagement page to the API
- [ ] Implement user creation and editing
- [ ] Set up role-based permissions throughout the app
- [ ] Add project assignment functionality

**Files to modify:**
- `frontend/src/pages/admin/UserManagement.tsx`
- `frontend/src/components/common/Table.tsx` (for reusable data tables)

### 6. Period Management and Visualization ⏳

- [ ] Implement period creation and editing
- [ ] Connect visualization components to real data
- [ ] Add data analysis features

**Files to modify:**
- Create new components for period management
- Update visualization components with real data

### 7. Testing and Polishing ⏳

- [ ] Test all API integrations
- [ ] Ensure proper error handling throughout the app
- [ ] Add loading states to improve UX
- [ ] Fix any data format inconsistencies

## Recent Improvements

We've made significant progress on the frontend-backend integration:

1. **Complete Authentication Flow** ✅:
   - Implemented protected routes that correctly redirect to login page when not authenticated
   - Fixed the authentication context to properly verify tokens
   - Implemented proper logout functionality
   - Ensured auth state is maintained between page refreshes

2. **Project Management Integration** ✅:
   - Connected Dashboard, ProjectList, and ProjectDetail to load real data from the API
   - Implemented the ProjectForm for creating and editing projects with real API connections
   - Added proper error handling and loading states throughout the app
   - Created FileUploader component for file management

3. **Key User Experience Improvements** ✅:
   - Added role-based access controls throughout the interface
   - Implemented client-side filtering for projects
   - Created data transformation layers between backend and frontend formats
   - Added loading indicators and error messages for better user feedback

## Next Steps

Our immediate next step is to implement the UserManagement page with real API connections. This will allow administrators to create, edit, and manage users in the system.

After that, we'll work on the Period Management interface to create and edit periods for projects.

## Completed Work Summary

We have successfully implemented:

1. **Authentication Flow**:
   - Login, register, and logout functionality
   - Protected routes with role-based access control
   - Token validation and secure storage

2. **Core Services Layer**:
   - API client with request/response interceptors
   - Domain-specific services for all entities
   - Data transformation between backend and frontend

3. **Project Management**:
   - Dashboard with real-time project data
   - Project listing with filtering and searching
   - Project details view with period selection
   - Project creation and editing form
   - File upload component for document management

## Setup and Running the Application

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

5. Run the database migrations:
   ```bash
   alembic upgrade head
   ```

6. Seed the database with test data:
   ```bash
   python scripts/seed_data.py
   ```

7. Run the development server:
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

## Authentication Test Credentials

Use these credentials to test the login functionality:

- **Admin User**:
  Email: admin@example.com
  Password: password

- **Manager User**:
  Email: manager@example.com
  Password: password

- **Regular User**:
  Email: user@example.com
  Password: password
