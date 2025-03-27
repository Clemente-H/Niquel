// src/services/authService.ts
import { IAuthResponse, ILoginCredentials, IRegisterData, IUser } from '../types';
import apiClient from './apiClient';

/**
 * Servicio para gestionar la autenticación de usuarios
 */
class AuthService {
  /**
   * Iniciar sesión con credenciales
   */
  public async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    try {
      // El backend espera los datos en formato de formulario OAuth2
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      // La ruta del backend es /auth/token con formato de formulario
      const response = await apiClient.post<{access_token: string, token_type: string}>(
        '/auth/token',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Procesar respuesta del backend
      const { access_token, token_type } = response.data;

      // Guardar token de autenticación
      apiClient.setAuthToken(access_token);

      // Cargar datos del usuario actual
      const userResponse = await apiClient.get('/users/me');

      // Construir respuesta de autenticación
      const authResponse: IAuthResponse = {
        token: access_token,
        user: userResponse.data,
      };

      return authResponse;
    } catch (error) {
      console.error('Login failed:', error);
      // Asegurar que se elimine cualquier token existente en caso de error
      this.logout();
      throw error;
    }
  }

  /**
   * Registrar un nuevo usuario
   */
  public async register(data: IRegisterData): Promise<IAuthResponse> {
    try {
      // El backend devuelve {access_token, token_type} pero queremos transformarlo a IAuthResponse
      const response = await apiClient.post<{access_token: string, token_type: string}>('/auth/register', data);

      // Guardar token de autenticación
      const { access_token } = response.data;
      apiClient.setAuthToken(access_token);

      // Cargar datos del usuario recién creado
      const userResponse = await apiClient.get('/users/me');

      // Construir respuesta de autenticación
      const authResponse: IAuthResponse = {
        token: access_token,
        user: userResponse.data,
      };

      return authResponse;
    } catch (error) {
      // Asegurar que se elimine cualquier token existente en caso de error
      this.logout();
      throw error;
    }
  }

  /**
   * Obtener información del usuario actual
   */
  public async getCurrentUser(): Promise<IUser | null> {
    // Verificar si hay token
    if (!apiClient.isAuthenticated()) {
      return null;
    }

    try {
      const response = await apiClient.get<IUser>('/users/me');
      return response.data;
    } catch (error) {
      // Si hay un error, eliminar el token y retornar null
      console.error("Error getting current user:", error);
      this.logout();
      return null;
    }
  }

  /**
   * Obtener el token de autenticación
   */
  public getAuthToken(): string | null {
    return apiClient.getAuthToken();
  }

  /**
   * Cerrar sesión
   */
  public logout(): void {
    apiClient.removeAuthToken();
  }

  /**
   * Verificar si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

// Exportar una instancia única del servicio
const authService = new AuthService();
export default authService;
