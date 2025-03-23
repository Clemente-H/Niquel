import React from 'react';
import { Navigate } from 'react-router-dom';
import { IWithChildrenProps, UserRole } from '../../types';

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
  // Mock de estado de autenticación (esto vendría del contexto de autenticación)
  const isAuthenticated = true; // Cambiar a false para probar redirección
  const userRole: UserRole = 'admin';
  
  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Verificar si se requieren roles específicos
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    // Redirigir a una página de acceso denegado o al dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si está autenticado y tiene los roles necesarios, mostrar la ruta protegida
  return <>{children}</>;
};

export default ProtectedRoute;