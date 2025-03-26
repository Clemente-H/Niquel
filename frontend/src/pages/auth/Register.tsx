// src/pages/auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import Button from '../../components/common/Button';
import { IRegisterData } from '../../types';
import { useAuth } from '../../store/AuthContext';

/**
 * Página de registro de usuario
 */
const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();

  // Estado para el formulario
  const [formData, setFormData] = useState<IRegisterData>({
    name: '',
    email: '',
    password: '',
    role: 'regular'  // Por defecto, los nuevos usuarios son regulares
  });

  // Estado para confirmación de contraseña
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Estado para errores y carga
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Validar coincidencia de contraseñas
    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // Registrar usuario usando el servicio de autenticación
      const authResponse = await register(formData);

      // Redireccionar al dashboard
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Error al registrar el usuario. Intente nuevamente.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>

      {/* Mensaje de error */}
      {(error || authError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error || authError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Nombre Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre y Apellido"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Repetir contraseña"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2"
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          Crear Cuenta
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/auth/login" className="text-blue-600 hover:text-blue-800">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
};

export default Register;
