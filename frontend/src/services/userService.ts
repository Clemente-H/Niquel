// src/services/userService.ts
import { IUser, IUserCreate, IUserUpdate } from '../types';
import apiClient from './apiClient';

interface IUserListResponse {
  items: IUser[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/**
 * Servicio para gestionar usuarios
 */
class UserService {
  private baseUrl = '/users';

  /**
   * Obtener lista de usuarios (solo admin)
   */
  public async getUsers(page: number = 1, limit: number = 10): Promise<IUserListResponse> {
    const response = await apiClient.get<IUserListResponse>(
      `${this.baseUrl}?skip=${(page - 1) * limit}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Obtener un usuario por su ID
   */
  public async getUserById(id: string): Promise<IUser> {
    const response = await apiClient.get<IUser>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Obtener el usuario actual
   */
  public async getCurrentUser(): Promise<IUser> {
    const response = await apiClient.get<IUser>(`${this.baseUrl}/me`);
    return response.data;
  }

  /**
   * Crear un nuevo usuario (solo admin)
   */
  public async createUser(userData: IUserCreate): Promise<IUser> {
    const response = await apiClient.post<IUser>(this.baseUrl, userData);
    return response.data;
  }

  /**
   * Actualizar un usuario
   */
  public async updateUser(id: string, userData: IUserUpdate): Promise<IUser> {
    const response = await apiClient.put<IUser>(`${this.baseUrl}/${id}`, userData);
    return response.data;
  }

  /**
   * Eliminar un usuario (solo admin)
   */
  public async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Cambiar el estado de un usuario (activar/desactivar)
   */
  public async toggleUserStatus(id: string, isActive: boolean): Promise<IUser> {
    return this.updateUser(id, { status: isActive ? 'active' : 'inactive' });
  }

  /**
   * Transformar los datos de la API al formato del frontend
   * (Convertir de snake_case a camelCase)
   */
  private transformUserData(userData: any): IUser {
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.is_active ? 'active' : 'inactive',
      lastLogin: userData.last_login,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    };
  }
}

// Exportar una instancia única del servicio
const userService = new UserService();
export default userService;
