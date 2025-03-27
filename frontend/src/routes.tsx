import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { UserRole } from './types';

// Placeholder for the component of loading
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy loading of components to improve performance
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ProjectList = lazy(() => import('./pages/projects/ProjectList'));
const ProjectDetail = lazy(() => import('./pages/projects/ProjectDetail'));
const ProjectForm = lazy(() => import('./pages/projects/ProjectForm'));
const PeriodForm = lazy(() => import('./pages/periods/PeriodForm'));
const PeriodDetail = lazy(() => import('./pages/periods/PeriodDetail'));
const PeriodVisualization = lazy(() => import('./pages/periods/PeriodVisualization'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Root route redirects to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Authentication routes (not protected) */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Protected routes for dashboard - wrapped in ProtectedRoute */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />

          {/* Period management routes */}
          <Route path="projects/:id/periods/new" element={<PeriodForm />} />
          <Route path="projects/:id/periods/:periodId" element={<PeriodDetail />} />
          <Route path="projects/:id/periods/:periodId/edit" element={<PeriodForm isEdit={true} />} />
          <Route path="projects/:id/periods/:periodId/visualization" element={<PeriodVisualization />} />

          {/* Admin routes with specific roles */}
          <Route path="admin/users" element={
            <ProtectedRoute requiredRoles={['admin', 'manager']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/settings" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <div>System configuration</div>
            </ProtectedRoute>
          } />
        </Route>

        {/* Route for pages not found */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
