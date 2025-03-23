import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Users, Settings, BarChart } from 'lucide-react';
import { IBaseComponentProps, UserRole } from '../../types';

/**
 * Props para el componente de barra lateral
 */
interface ISidebarProps extends IBaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Item de navegación en la barra lateral
 */
interface INavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: UserRole[];
}

/**
 * Componente de barra lateral para la navegación
 * Muestra diferentes opciones según el rol del usuario
 */
const Sidebar: React.FC<ISidebarProps> = ({ isOpen, onClose, className = '' }) => {
  // Mock del rol de usuario (esto vendría del contexto de autenticación)
  const userRole: UserRole = 'admin'; // Puede ser 'admin', 'manager', o 'regular'
  
  // Determinar si mostrar opciones de admin/manager
  const hasAdminAccess = userRole === "admin" || userRole === "manager";

  // Definición de los items de navegación
  const navItems: INavItem[] = [
    {
      to: "/dashboard",
      icon: <Home size={20} className="mr-3 text-blue-600" />,
      label: "Dashboard"
    },
    {
      to: "/projects",
      icon: <FileText size={20} className="mr-3 text-blue-600" />,
      label: "Proyectos"
    },
    {
      to: "/admin/users",
      icon: <Users size={20} className="mr-3 text-blue-600" />,
      label: "Gestión de Usuarios",
      roles: ['admin', 'manager']
    },
    {
      to: "/admin/settings",
      icon: <Settings size={20} className="mr-3 text-blue-600" />,
      label: "Administración",
      roles: ['admin', 'manager']
    }
  ];

  // Filtrar los items de navegación según el rol del usuario
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  // Componente para el overlay que cierra el sidebar al hacer click (solo en móvil)
  const Overlay: React.FC = () => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-10" 
      onClick={onClose}
    />
  );

  return (
    <>
      {isOpen && <Overlay />}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-white shadow-lg transition-transform md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        <div className="p-4 bg-blue-50">
          <h2 className="font-bold text-blue-900 flex items-center">
            <BarChart size={20} className="mr-2" /> 
            Dashboard
          </h2>
        </div>
        <nav className="p-2">
          <ul>
            {filteredNavItems.map((item, index) => (
              <li key={index} className="mb-1">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
            
            {/* Separador para secciones admin */}
            {hasAdminAccess && (
              <li className="my-2 border-t border-gray-200"></li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;