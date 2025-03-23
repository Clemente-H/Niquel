import React from 'react';
import { Outlet } from 'react-router-dom';
import { IWithChildrenProps } from '../../types';

/**
 * Props para el componente AuthLayout
 */
interface IAuthLayoutProps extends IWithChildrenProps {
  // Propiedades adicionales específicas del layout si son necesarias
}

/**
 * Layout para las páginas de autenticación
 * Proporciona un diseño simple centrado para login y registro
 */
const AuthLayout: React.FC<IAuthLayoutProps> = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-col flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Gestión de Proyectos
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Accede a tu cuenta para gestionar tus proyectos
            </p>
          </div>
          
          {/* Contenido de autenticación (Login/Register) */}
          <div className="bg-white p-8 shadow-md rounded-lg">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Footer simple */}
      <footer className="p-4 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Sistema de Gestión de Proyectos - v1.0
      </footer>
    </div>
  );
};

export default AuthLayout;