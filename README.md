# Niquel - Project Management System

A TypeScript React frontend for a role-based project management system.

## Key Features

- **User Authentication**: Email/password login system
- **User Management**: Support for 3 different roles (Admin, Manager, Regular)
- **Project Management**: Track project status and historical changes
- **User Assignment**: Project access control based on user assignments
- **File Management**: Associate files with projects
- **Period Management**: Control different time periods within each project

## Project Structure

```
├── public/                # Static public assets
├── src/                   # Source code
│   ├── assets/            # Static assets (images, icons, etc.)
│   ├── components/        # Reusable components
│   │   ├── common/        # Generic components (Button, Card, etc.)
│   │   └── layout/        # Layout components (Sidebar, Header, Footer)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components by route
│   │   ├── auth/          # Authentication pages (Login, Register)
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── projects/      # Project management pages
│   │   └── admin/         # Admin pages (User Management)
│   ├── services/          # API services
│   ├── store/             # State management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root component
│   ├── index.tsx          # Entry point
│   ├── routes.tsx         # Route configuration
│   └── index.css          # Global styles
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies and scripts
```

## Current Status

### Completed Phases
- [x] Phase 0: Planning and initial structure
- [x] Phase 1: Frontend architecture definition
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
- [ ] Phase 11: Additional functionality
  - [ ] Period management components
  - [ ] File upload integration
  - [ ] Visualization components
- [ ] Phase 12: Backend integration and testing
  - [ ] Connect to API endpoints
  - [ ] Error handling and loading states
  - [ ] End-to-end testing

## Technologies Used

- **React 18** with TypeScript
- **Vite** as bundler
- **TailwindCSS** for styling
- **React Router** for routing
- **Lucide React** for icons
- **Axios** for API calls

## Setup and Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [REPOSITORY_URL]
cd project-manager/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at: http://localhost:5173

### Test Data
For testing the login:
- Email: admin@example.com
- Password: password

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

- The frontend currently uses mocked data for development, pending integration with a real API
- All forms include validation and loading states to improve UX
- The project is structured to easily integrate with a backend API in future phases
- Route protection is implemented based on user roles
