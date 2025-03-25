// src/services/assignmentService.ts
import { IUser, IUserAssignment } from '../types';
import apiClient from './apiClient';

interface IAssignmentListResponse {
  items: IUserAssignment[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

interface IAssignmentWithUser extends IUserAssignment {
  user: IUser;
}

/**
 * Servicio para gestionar asignaciones de usuarios a proyectos
 */
class AssignmentService {
  /**
   * Obtener todas las asignaciones de un proyecto
   */
  public async getProjectAssignments(
    projectId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IAssignmentListResponse> {
    const url = `/projects/${projectId}/assignments?skip=${(page - 1) * limit}&limit=${limit}`;
    const response = await apiClient.get<IAssignmentListResponse>(url);

    // Transformar datos para asegurar que cumplen con la interfaz IUserAssignment
    const transformedItems = response.data.items.map(assignment => this.transformAssignmentData(assignment));

    return {
      ...response.data,
      items: transformedItems
    };
  }

  /**
   * Asignar un usuario a un proyecto
   */
  public async assignUserToProject(
    projectId: string,
    userId: string,
    role: string = 'viewer'
  ): Promise<IAssignmentWithUser> {
    const data = {
      user_id: userId,
      role: role
    };

    const response = await apiClient.post<IAssignmentWithUser>(`/projects/${projectId}/assignments`, data);
    return {
      ...this.transformAssignmentData(response.data),
      user: response.data.user
    };
  }

  /**
   * Asignar múltiples usuarios a un proyecto (batch)
   */
  public async batchAssignUsers(
    projectId: string,
    userIds: string[],
    role: string = 'viewer'
  ): Promise<IUserAssignment[]> {
    const data = {
      project_id: projectId,
      user_ids: userIds,
      role: role
    };

    const response = await apiClient.post<IUserAssignment[]>(`/projects/${projectId}/batch-assign`, data);
    return response.data.map(assignment => this.transformAssignmentData(assignment));
  }

  /**
   * Actualizar una asignación existente
   */
  public async updateAssignment(
    assignmentId: string,
    role: string
  ): Promise<IUserAssignment> {
    const data = {
      role: role
    };

    const response = await apiClient.put<IUserAssignment>(`/assignments/${assignmentId}`, data);
    return this.transformAssignmentData(response.data);
  }

  /**
   * Eliminar una asignación de usuario a proyecto
   */
  public async deleteAssignment(assignmentId: string): Promise<void> {
    await apiClient.delete(`/assignments/${assignmentId}`);
  }

  /**
   * Transformar datos de la API al formato del frontend
   * (Convertir de snake_case a camelCase)
   */
  private transformAssignmentData(assignmentData: any): IUserAssignment {
    return {
      userId: assignmentData.user_id,
      projectId: assignmentData.project_id,
      role: assignmentData.role,
      assignedAt: assignmentData.assigned_at
    };
  }
}

// Exportar una instancia única del servicio
const assignmentService = new AssignmentService();
export default assignmentService;
