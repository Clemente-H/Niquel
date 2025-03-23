import React from 'react';
import { IBaseComponentProps, IWithChildrenProps } from '../../types';

/**
 * Props para el componente Card
 */
interface ICardProps extends IBaseComponentProps, IWithChildrenProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  noPadding?: boolean;
  footer?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * Componente Card reutilizable
 * Proporciona un contenedor con sombra y bordes redondeados
 */
const Card: React.FC<ICardProps> = ({
  children,
  title,
  icon,
  actions,
  noPadding = false,
  footer,
  isLoading = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow overflow-hidden ${className}`}
      {...props}
    >
      {/* Cabecera condicional si hay título o acciones */}
      {(title || actions) && (
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {title && (
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
            </h3>
          )}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}

      {/* Contenido principal */}
      <div className={`${!noPadding ? 'p-6' : ''} ${isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer opcional */}
      {footer && (
        <div className="border-t border-gray-200 p-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
