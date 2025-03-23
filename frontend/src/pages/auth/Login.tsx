import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Button from '../../components/common/Button';
import { ILoginCredentials } from '../../types';

/**
 * Página de inicio de sesión
 */
const Login: React.FC = () => {
  const navigate = useNavigate();

  // Estado para el formulario
  const [credentials, setCredentials] = useState<ILoginCredentials>({
    email: '',
    password: ''
  });

  // Estado para errores y carga
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simular llamada a la API (esto sería reemplazado por una llamada real)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validación simple (en producción, esto se haría en el backend)
      if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
        // Login exitoso, redireccionar al dashboard
        navigate('/dashboard');
      } else {
        // Mostrar error
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intente nuevamente.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
              value={credentials.email}
              onChange={handleChange}
              required
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div className="mb-6">
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
              value={credentials.password}
              onChange={handleChange}
              required
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="********"
            />
          </div>
          <div className="mt-1 text-right">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              ¿Olvidó su contraseña?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2"
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        ¿No tiene una cuenta?{' '}
        <Link to="/auth/register" className="text-blue-600 hover:text-blue-800">
          Regístrese aquí
        </Link>
      </div>
    </div>
  );
};

export default Login;
