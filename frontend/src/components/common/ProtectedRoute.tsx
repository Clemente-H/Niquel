// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { IWithChildrenProps, UserRole } from '../../types';
import { useAuth } from '../../store/AuthContext';

/**
 * Props para el componente ProtectedRoute
 */
interface IProtectedRouteProps extends IWithChildrenProps {
  requiredRoles?: UserRole[]; // Roles que tienen acceso a la ruta
}

/**
 * Componente que protege rutas basado en autenticación y roles
 * Redirige a la página de login si el usuario no está autenticado
 * o no tiene los roles requeridos
 */
const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  children,
  requiredRoles = []
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    // Guardar la ubicación actual para redireccionar después del login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Verificar si se requieren roles específicos
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    // Redirigir a una página de acceso denegado o al dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Si está autenticado y tiene los roles necesarios, mostrar la ruta protegida
  return <>{children}</>;
};

export default ProtectedRoute;
