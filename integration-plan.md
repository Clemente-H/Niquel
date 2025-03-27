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

### 4. Dashboard and Project Views 🔄

- [ ] Update Dashboard to fetch projects from API
- [ ] Implement ProjectList with real data and filtering
- [ ] Connect ProjectDetail to load project data and periods
- [ ] Update ProjectForm to create/edit real projects
- [ ] Add file upload/download functionality

**Files to modify:**
- `frontend/src/pages/dashboard/Dashboard.tsx`
- `frontend/src/pages/projects/ProjectList.tsx`
- `frontend/src/pages/projects/ProjectDetail.tsx`
- `frontend/src/pages/projects/ProjectForm.tsx`
- `frontend/src/components/common/FileUploader.tsx`

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

We've made significant progress on the authentication integration:

1. **Complete Authentication Flow**:
   - Implemented protected routes that correctly redirect to login page when not authenticated
   - Fixed the authentication context to properly verify tokens
   - Implemented proper logout functionality
   - Ensured auth state is maintained between page refreshes

2. **Route Protection**:
   - Added `ProtectedRoute` component to restrict access to authenticated users
   - Implemented role-based route protection for admin pages
   - Integrated login redirect with state to return users to their intended destination

3. **Auth Context Improvements**:
   - Improved token validation and user loading
   - Added better error handling during authentication processes
   - Implemented proper token cleanup on auth failures

## Completed Work Summary

We have successfully implemented the core services layer and authentication flow:

1. **API Client**: A centralized service that manages API requests, with features like:
   - Automatic token management in localStorage
   - Request/response interceptors for authentication
   - Automatic error handling
   - Common methods for HTTP operations

2. **Authentication Services**:
   - Comprehensive auth context for global state management
   - JWT token handling
   - Login, register, and logout functionality
   - Protected routes with role-based access control

3. **Core Services**:
   - Services for all major entities (users, projects, periods, files, assignments)
   - Data transformation between backend (snake_case) and frontend (camelCase)
   - Type-safe API interactions

## Next Steps

1. **Connect UI components to the services**:
   - Integrate the Dashboard and Project List with the real API
   - Update forms to use the service layer

2. **Implement real data flows**:
   - Replace mock data with API calls
   - Handle loading and error states
   - Implement proper data caching where appropriate

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
