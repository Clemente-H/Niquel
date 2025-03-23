import React from 'react';
import { IBaseComponentProps } from '../../types';

/**
 * Configuración de estilo para un estado
 */
interface IStatusStyle {
  bg: string;
  text: string;
  label?: string;
}

/**
 * Configuración para diferentes tipos de estados
 */
type StatusConfig = Record<string, IStatusStyle> & {
  default: IStatusStyle;
};

/**
 * Props para el componente StatusBadge
 */
interface IStatusBadgeProps extends IBaseComponentProps {
  status: string;
  statusConfig?: StatusConfig;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente StatusBadge para mostrar estados con códigos de color
 */
const StatusBadge: React.FC<IStatusBadgeProps> = ({ 
  status, 
  statusConfig, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  // Configuraciones predeterminadas para diferentes tipos de estado
  const defaultStatusConfigs: Record<string, StatusConfig> = {
    // Estados de proyecto
    project: {
      'Completado': { bg: 'bg-green-100', text: 'text-green-800' },
      'En progreso': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'En revisión': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Planificación': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800' }
    },
    // Estados de usuario
    user: {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' },
      'inactive': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactivo' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800' }
    }
  };

  // Usar la configuración personalizada o la configuración del proyecto por defecto
  const config = statusConfig || defaultStatusConfigs.project;
  
  // Obtener la configuración para este estado específico o usar la configuración predeterminada
  const { bg, text, label } = config[status] || config.default;
  
  // Determinar la etiqueta a mostrar (la etiqueta personalizada o el estado en sí)
  const displayLabel = label || status;

  // Clases de tamaño
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full font-medium ${bg} ${text} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {displayLabel}
    </span>
  );
};

export default StatusBadge;