// src/services/projectService.ts
import { IProject, IProjectCreate, IProjectUpdate, ProjectStatus, ProjectType } from '../types';
import apiClient from './apiClient';

interface IProjectListResponse {
  items: IProject[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

interface IProjectStatsResponse extends IProject {
  period_count: number;
  file_count: number;
  assigned_users_count: number;
}

/**
 * Servicio para gestionar proyectos
 */
class ProjectService {
  private baseUrl = '/projects';

  /**
   * Obtener lista de proyectos con filtros opcionales
   */
  public async getProjects(
    page: number = 1,
    limit: number = 10,
    type?: ProjectType,
    status?: ProjectStatus
  ): Promise<IProjectListResponse> {
    let url = `${this.baseUrl}?skip=${(page - 1) * limit}&limit=${limit}`;

    if (type) {
      url += `&type=${type}`;
    }

    if (status) {
      url += `&status=${status}`;
    }

    try {
      const response = await apiClient.get<IProjectListResponse>(url);

      // Transformar datos para asegurar que cumplen con la interfaz IProject
      const transformedItems = response.data.items.map(project => this.transformProjectData(project));

      return {
        ...response.data,
        items: transformedItems
      };
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Reenviar el error para que el componente pueda manejarlo
      throw error;
    }
  }

  /**
   * Obtener un proyecto por su ID con estadísticas
   */
  public async getProjectById(id: string): Promise<IProject> {
    try {
      const response = await apiClient.get<IProjectStatsResponse>(`${this.baseUrl}/${id}`);
      return this.transformProjectData(response.data);
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo proyecto
   */
  public async createProject(projectData: IProjectCreate): Promise<IProject> {
    try {
      // Transformar nombres de campos a snake_case para el backend
      const apiData = {
        name: projectData.name,
        description: projectData.description,
        location: projectData.location,
        type: projectData.type,
        status: projectData.status,
        start_date: projectData.startDate,
        owner_id: projectData.ownerId
      };

      const response = await apiClient.post<IProject>(this.baseUrl, apiData);
      return this.transformProjectData(response.data);
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  /**
   * Actualizar un proyecto existente
   */
  public async updateProject(id: string, projectData: IProjectUpdate): Promise<IProject> {
    try {
      // Eliminar campos undefined y transformar a snake_case
      const updateData: any = {};

      if (projectData.name !== undefined) updateData.name = projectData.name;
      if (projectData.description !== undefined) updateData.description = projectData.description;
      if (projectData.location !== undefined) updateData.location = projectData.location;
      if (projectData.type !== undefined) updateData.type = projectData.type;
      if (projectData.status !== undefined) updateData.status = projectData.status;
      if (projectData.startDate !== undefined) updateData.start_date = projectData.startDate;
      if (projectData.ownerId !== undefined) updateData.owner_id = projectData.ownerId;

      const response = await apiClient.put<IProject>(`${this.baseUrl}/${id}`, updateData);
      return this.transformProjectData(response.data);
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un proyecto
   */
  public async deleteProject(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Transformar datos de la API al formato del frontend
   * (Convertir de snake_case a camelCase)
   */
  private transformProjectData(projectData: any): IProject {
    return {
      id: projectData.id,
      name: projectData.name,
      description: projectData.description || "",
      location: projectData.location || "",
      type: projectData.type as ProjectType,
      status: projectData.status as ProjectStatus,
      startDate: projectData.start_date,
      owner: projectData.owner_name || "Sin asignar", // En caso que el backend devuelva owner_name
      ownerId: projectData.owner_id,
      lastUpdate: projectData.updated_at,
      createdAt: projectData.created_at,
      updatedAt: projectData.updated_at
    };
  }
}

// Exportar una instancia única del servicio
const projectService = new ProjectService();
export default projectService;
