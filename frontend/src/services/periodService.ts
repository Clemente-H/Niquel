// src/services/periodService.ts
import { IPeriod, IPeriodCreate, IPeriodUpdate } from '../types';
import apiClient from './apiClient';

interface IPeriodListResponse {
  items: IPeriod[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

interface IPeriodWithDetailsResponse extends IPeriod {
  file_count: number;
}

/**
 * Servicio para gestionar períodos de proyectos
 */
class PeriodService {
  /**
   * Obtener lista de períodos para un proyecto específico
   */
  public async getProjectPeriods(
    projectId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IPeriodListResponse> {
    const url = `/projects/${projectId}/periods?skip=${(page - 1) * limit}&limit=${limit}`;
    const response = await apiClient.get<IPeriodListResponse>(url);

    // Transformar datos para asegurar que cumplen con la interfaz IPeriod
    const transformedItems = response.data.items.map(period => this.transformPeriodData(period));

    return {
      ...response.data,
      items: transformedItems
    };
  }

  /**
   * Obtener un período específico por ID
   */
  public async getPeriodById(periodId: string): Promise<IPeriod> {
    const response = await apiClient.get<IPeriodWithDetailsResponse>(`/periods/${periodId}`);
    return this.transformPeriodData(response.data);
  }

  /**
   * Crear un nuevo período para un proyecto
   */
  public async createPeriod(projectId: string, periodData: IPeriodCreate): Promise<IPeriod> {
    // Transformar nombres de campos a snake_case para el backend
    const apiData = {
      name: periodData.periodName,
      start_date: periodData.startDate,
      end_date: periodData.endDate,
      volume: periodData.volume,
      start_time: periodData.startTime,
      width: periodData.width,
      max_depth: periodData.maxDepth,
      notes: periodData.notes,
      project_id: projectId
    };

    const response = await apiClient.post<IPeriod>(`/projects/${projectId}/periods`, apiData);
    return this.transformPeriodData(response.data);
  }

  /**
   * Actualizar un período existente
   */
  public async updatePeriod(periodId: string, periodData: IPeriodUpdate): Promise<IPeriod> {
    // Eliminar campos undefined y transformar a snake_case
    const updateData: any = {};

    if (periodData.periodName !== undefined) updateData.name = periodData.periodName;
    if (periodData.startDate !== undefined) updateData.start_date = periodData.startDate;
    if (periodData.endDate !== undefined) updateData.end_date = periodData.endDate;
    if (periodData.volume !== undefined) updateData.volume = periodData.volume;
    if (periodData.startTime !== undefined) updateData.start_time = periodData.startTime;
    if (periodData.width !== undefined) updateData.width = periodData.width;
    if (periodData.maxDepth !== undefined) updateData.max_depth = periodData.maxDepth;
    if (periodData.notes !== undefined) updateData.notes = periodData.notes;

    const response = await apiClient.put<IPeriod>(`/periods/${periodId}`, updateData);
    return this.transformPeriodData(response.data);
  }

  /**
   * Eliminar un período
   */
  public async deletePeriod(periodId: string): Promise<void> {
    await apiClient.delete(`/periods/${periodId}`);
  }

  /**
   * Transformar datos de la API al formato del frontend
   * (Convertir de snake_case a camelCase)
   */
  private transformPeriodData(periodData: any): IPeriod {
    return {
      id: periodData.id,
      projectId: periodData.project_id,
      periodName: periodData.name,
      startDate: periodData.start_date,
      endDate: periodData.end_date,
      volume: periodData.volume?.toString(),
      startTime: periodData.start_time,
      width: periodData.width?.toString(),
      maxDepth: periodData.max_depth?.toString(),
      notes: periodData.notes,
      createdAt: periodData.created_at,
      updatedAt: periodData.updated_at,
      createdBy: periodData.created_by
    };
  }
}

// Exportar una instancia única del servicio
const periodService = new PeriodService();
export default periodService;
