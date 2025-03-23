import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';

// Placeholder para el componente de carga
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy loading de componentes para mejorar el rendimiento
const Login = lazy(() => import('./pages/auth/Login'));
//const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
//const ProjectList = lazy(() => import('./pages/projects/ProjectList'));
//const ProjectDetail = lazy(() => import('./pages/projects/ProjectDetail'));
//const ProjectForm = lazy(() => import('./pages/projects/ProjectForm'));
//const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Ruta raíz redirecta al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rutas de autenticación */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          {/*<Route path="register" element={<Register />} /> */}
        </Route>
        
        {/* Rutas protegidas del dashboard */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          {/*<Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
          <Route path="admin/users" element={<UserManagement />} />*/}
          <Route path="admin/settings" element={<div>Configuración del sistema</div>} />
        </Route>
        
        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;