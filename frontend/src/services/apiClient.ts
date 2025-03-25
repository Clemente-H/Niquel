// src/services/apiClient.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API URL proveniente de las variables de entorno
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Cliente API base para comunicarse con el backend
 */
class ApiClient {
  private instance: AxiosInstance;
  private authTokenKey = 'auth_token';

  constructor() {
    // Crear instancia de axios con configuración base
    this.instance = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configurar interceptores de peticiones
    this.instance.interceptors.request.use(
      (config) => {
        // Agregar token de autenticación si existe
        const token = localStorage.getItem(this.authTokenKey);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Configurar interceptores de respuestas
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        // Manejar errores comunes
        if (error.response) {
          const status = error.response.status;
          // Si el token expiró o es inválido, redirigir al login
          if (status === 401) {
            // Solo limpiar el token si no estamos en la página de login
            if (!window.location.pathname.includes('/auth/')) {
              localStorage.removeItem(this.authTokenKey);
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Realizar una petición GET
   */
  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  /**
   * Realizar una petición POST
   */
  public post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  /**
   * Realizar una petición PUT
   */
  public put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  /**
   * Realizar una petición DELETE
   */
  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  /**
   * Realizar una petición para subir archivos (multipart/form-data)
   */
  public uploadFile<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (percentage: number) => void
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            onProgress(percentCompleted);
          }
        : undefined,
    });
  }

  /**
   * Guardar token de autenticación
   */
  public setAuthToken(token: string): void {
    localStorage.setItem(this.authTokenKey, token);
  }

  /**
   * Obtener token de autenticación
   */
  public getAuthToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  /**
   * Eliminar token de autenticación
   */
  public removeAuthToken(): void {
    localStorage.removeItem(this.authTokenKey);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Obtener la URL base de la API
   */
  public getBaseUrl(): string {
    return this.instance.defaults.baseURL || '';
  }
}

// Exportar una única instancia del cliente
const apiClient = new ApiClient();
export default apiClient;
