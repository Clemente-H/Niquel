// src/services/fileService.ts
import { IProjectFile } from '../types';
import apiClient from './apiClient';

interface IFileListResponse {
  items: IProjectFile[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/**
 * Servicio para gestionar archivos
 */
class FileService {
  private baseUrl = '/files';

  /**
   * Obtener lista de archivos con filtros opcionales
   */
  public async getFiles(
    page: number = 1,
    limit: number = 20,
    projectId?: string,
    periodId?: string,
    category?: string
  ): Promise<IFileListResponse> {
    let url = `${this.baseUrl}?skip=${(page - 1) * limit}&limit=${limit}`;

    if (projectId) {
      url += `&project_id=${projectId}`;
    }

    if (periodId) {
      url += `&period_id=${periodId}`;
    }

    if (category) {
      url += `&category=${category}`;
    }

    const response = await apiClient.get<IFileListResponse>(url);

    // Transformar datos para asegurar que cumplen con la interfaz IProjectFile
    const transformedItems = response.data.items.map(file => this.transformFileData(file));

    return {
      ...response.data,
      items: transformedItems
    };
  }

  /**
   * Obtener un archivo por su ID
   */
  public async getFileById(fileId: string): Promise<IProjectFile> {
    const response = await apiClient.get<any>(`${this.baseUrl}/${fileId}`);
    return this.transformFileData(response.data);
  }

  /**
   * Subir un nuevo archivo
   */
  public async uploadFile(
    file: File,
    projectId: string,
    periodId?: string,
    category: string = 'document',
    onProgress?: (percentage: number) => void
  ): Promise<IProjectFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    if (periodId) {
      formData.append('period_id', periodId);
    }
    formData.append('category', category);

    const response = await apiClient.uploadFile<any>(this.baseUrl, formData, onProgress);
    return this.transformFileData(response.data);
  }

  /**
   * Eliminar un archivo
   */
  public async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${fileId}`);
  }

  /**
   * Obtener URL para descargar un archivo
   */
  public getDownloadUrl(fileId: string): string {
    return `${apiClient.getBaseUrl()}${this.baseUrl}/${fileId}/download`;
  }

  /**
   * Transformar datos de la API al formato del frontend
   * (Convertir de snake_case a camelCase)
   */
  private transformFileData(fileData: any): IProjectFile {
    return {
      id: fileData.id,
      projectId: fileData.project_id,
      name: fileData.name,
      type: fileData.content_type,
      size: fileData.size,
      url: `/api/files/${fileData.id}/download`, // URL relativa para descargas
      category: fileData.category,
      uploadedBy: fileData.uploaded_by,
      uploadedAt: fileData.upload_date
    };
  }
}

// Exportar una instancia única del servicio
const fileService = new FileService();
export default fileService;
