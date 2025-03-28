export type GravityLevel = 1 | 2 | 3; // 1-verde, 2-amarillo, 3-rojo

export interface IGeoPoint {
  id: string;
  latitude: number;
  longitude: number;
  gravityLevel: GravityLevel;
  description?: string;
  kilometer?: number;
  section?: string;
  periodId: string;
  images?: IGeoPointImage[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface IGeoPointImage {
  id: string;
  fileName: string;
  path: string;
  size: number;
  contentType: string;
  geoPointId: string;
  uploadDate: string;
  uploadedBy?: string;
}

export interface IGeoPointCreate {
  latitude: number;
  longitude: number;
  gravityLevel: GravityLevel;
  description?: string;
  kilometer?: number;
  section?: string;
  periodId: string;
}

export interface IGeoPointUpdate {
  latitude?: number;
  longitude?: number;
  gravityLevel?: GravityLevel;
  description?: string;
  kilometer?: number;
  section?: string;
}
