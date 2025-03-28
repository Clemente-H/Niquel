import { IGeoPoint, IGeoPointCreate, IGeoPointUpdate, IGeoPointImage } from '../types/geoPoint.types';
import apiClient from './apiClient';

interface IGeoPointListResponse {
  items: IGeoPoint[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/**
 * Servicio para gestionar puntos geográficos
 */
class GeoPointService {
  /**
   * Obtener todos los puntos geográficos de un período
   */
  public async getGeoPointsByPeriod(
    periodId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IGeoPointListResponse> {
    const response = await apiClient.get<IGeoPointListResponse>(
      `/periods/${periodId}/geo-points?skip=${(page - 1) * limit}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Obtener un punto geográfico por su ID
   */
  public async getGeoPointById(geoPointId: string): Promise<IGeoPoint> {
    const response = await apiClient.get<IGeoPoint>(`/geo-points/${geoPointId}`);
    return response.data;
  }

  /**
   * Crear un nuevo punto geográfico
   */
  public async createGeoPoint(geoPointData: IGeoPointCreate): Promise<IGeoPoint> {
    const response = await apiClient.post<IGeoPoint>(
      `/periods/${geoPointData.periodId}/geo-points`,
      geoPointData
    );
    return response.data;
  }

  /**
   * Actualizar un punto geográfico existente
   */
  public async updateGeoPoint(
    geoPointId: string,
    geoPointData: IGeoPointUpdate
  ): Promise<IGeoPoint> {
    const response = await apiClient.put<IGeoPoint>(
      `/geo-points/${geoPointId}`,
      geoPointData
    );
    return response.data;
  }

  /**
   * Eliminar un punto geográfico
   */
  public async deleteGeoPoint(geoPointId: string): Promise<void> {
    await apiClient.delete(`/geo-points/${geoPointId}`);
  }

  /**
   * Obtener imágenes de un punto geográfico
   */
  public async getGeoPointImages(geoPointId: string): Promise<IGeoPointImage[]> {
    const response = await apiClient.get<IGeoPointImage[]>(
      `/geo-points/${geoPointId}/images`
    );
    return response.data;
  }

  /**
   * Subir una imagen para un punto geográfico
   */
  public async uploadGeoPointImage(
    geoPointId: string,
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<IGeoPointImage> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.uploadFile<IGeoPointImage>(
      `/geo-points/${geoPointId}/images`,
      formData,
      onProgress
    );
    return response.data;
  }

  /**
   * Eliminar una imagen de un punto geográfico
   */
  public async deleteGeoPointImage(
    geoPointId: string,
    imageId: string
  ): Promise<void> {
    await apiClient.delete(`/geo-points/${geoPointId}/images/${imageId}`);
  }
}

// Exportar una instancia única del servicio
const geoPointService = new GeoPointService();
export default geoPointService;
