import React from 'react';
import { IBaseComponentProps } from '../../types';

/**
 * Variantes de botón disponibles
 */
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'text';

/**
 * Tamaños de botón disponibles
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props para el componente Button
 */
interface IButtonProps extends IBaseComponentProps,
  React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}

/**
 * Componente Button reutilizable
 * Soporta diferentes variantes y tamaños
 */
const Button: React.FC<IButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  leftIcon,
  rightIcon,
  className = '',
  isLoading = false,
  isDisabled = false,
  ...props
}) => {
  // Configuración de variantes (colores)
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-transparent border border-current text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    text: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  // Configuración de tamaños
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Clases para estado de carga
  const loadingClass = isLoading ? 'opacity-70 cursor-wait' : '';

  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${loadingClass}
        ${className}
      `}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
