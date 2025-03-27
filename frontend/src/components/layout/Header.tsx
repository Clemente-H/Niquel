import React from 'react';
import { Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IBaseComponentProps } from '../../types';
import { useAuth } from '../../store/AuthContext';

/**
 * Props para el componente de encabezado
 */
interface IHeaderProps extends IBaseComponentProps {
  toggleSidebar: () => void;
}

/**
 * Componente de encabezado para la aplicación
 * Muestra el título, botón de menú y detalles del usuario
 */
const Header: React.FC<IHeaderProps> = ({ toggleSidebar, className = '' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Función para manejar el logout
  const handleLogout = (): void => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className={`bg-blue-900 text-white shadow-md ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-1 mr-4 rounded hover:bg-blue-800"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold">Sistema de Gestión de Proyectos</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-blue-800 px-3 py-1 rounded-full">
            <User size={18} className="mr-2" />
            <span>{`${user?.name || 'Usuario'} (${user?.role || 'invitado'})`}</span>
          </div>
          <button
            className="px-3 py-1 border border-white rounded hover:bg-blue-800"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
