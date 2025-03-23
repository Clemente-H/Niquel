import React from 'react';
import { IBaseComponentProps } from '../../types';

/**
 * Props para el componente de pie de página
 */
interface IFooterProps extends IBaseComponentProps {
  // Propiedades específicas para el footer si son necesarias
}

/**
 * Componente de pie de página
 */
const Footer: React.FC<IFooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`p-4 bg-gray-100 text-center text-gray-600 text-sm mt-auto ${className}`}>
      © {currentYear} Sistema de Gestión de Proyectos - v1.0
    </footer>
  );
};

export default Footer;
