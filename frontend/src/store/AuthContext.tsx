// src/store/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { IAuthContext, ILoginCredentials, IRegisterData, IUser, UserRole } from '../types';
import { authService } from '../services';

// Valor por defecto del contexto
const defaultAuthContext: IAuthContext = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => ({ token: "", user: {} as IUser }),
  logout: () => {},
  register: async () => ({ token: "", user: {} as IUser }),
  hasRole: () => false
};

// Crear el contexto
const AuthContext = createContext<IAuthContext>(defaultAuthContext);

// Hook personalizado para utilizar el contexto
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        // Verificar si hay un token en localStorage
        const storedToken = authService.getAuthToken();

        if (storedToken) {
          // Si hay un token, verificar si es válido intentando obtener el usuario
          const user = await authService.getCurrentUser();
          if (user) {
            setUser(user);
            setToken(storedToken);
          } else {
            // Si no hay usuario (token inválido), limpiar el estado y localStorage
            authService.logout();
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Si hay un error, limpiar el estado y localStorage
        authService.logout();
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Función para iniciar sesión
  const login = async (credentials: ILoginCredentials) => {
    setError(null);
    setIsLoading(true);

    try {
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      setToken(authResponse.token);
      return authResponse;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrar nuevo usuario
  const register = async (data: IRegisterData) => {
    setError(null);
    setIsLoading(true);

    try {
      const authResponse = await authService.register(data);
      setUser(authResponse.user);
      setToken(authResponse.token);
      return authResponse;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al registrar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  // Función para verificar si el usuario tiene cierto rol
  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    // Convertir a array si es un solo rol
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    return roles.includes(user.role);
  };

  const value: IAuthContext = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
