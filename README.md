# Project Management System - Frontend

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
│   │   ├── auth/          # Authentication pages (Login)
│   │   └── dashboard/     # Dashboard pages
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

### Current Phase
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
  - [x] Dashboard with project listing

### Next Phases
- [ ] Phase 8: State management implementation
- [ ] Phase 9: Remaining pages development
  - [ ] Project details
  - [ ] Project form
  - [ ] Period management
  - [ ] User management
- [ ] Phase 10: Backend integration
- [ ] Phase 11: Testing and optimization

## Technologies Used

- **React 18** with TypeScript
- **Vite** as bundler
- **TailwindCSS** for styling
- **React Router** for routing
- **Lucide React** for icons
- **Axios** for API calls (pending implementation)

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

1. **Routing System**: Configured with React Router, including lazy loading
2. **Simulated Authentication**: Functional login form (with mocked data)
3. **Responsive Layout**: Adaptable design with collapsible sidebar
4. **Reusable Components**: Button, Card, and StatusBadge implemented
5. **Strict Typing**: All interfaces and types defined with TypeScript
6. **Dashboard**: Project visualization with filtering

## Development Notes

- The frontend uses mocked data for development, pending integration with a real API
- The authentication system is currently simulated
- Route protection is configured but allows access by default for development
- The design follows the style guide defined with corporate colors in Tailwind
- All code comments and function names are in English for better maintainability
