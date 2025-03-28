import { IProjectFile } from './project.types';
import { IGeoPoint } from './geoPoint.types';

export interface IPeriod {
  id: number;
  projectId: number;
  periodName: string;
  startDate: string;
  endDate: string;
  volume?: string; // metros cúbicos por segundo
  startTime?: string;
  width?: string; // metros
  maxDepth?: string; // centímetros
  notes?: string;
  kmlFileId?: string; // ID del archivo KML principal
  kmlFile?: IProjectFile; // Referencia al archivo KML
  geoPoints?: IGeoPoint[]; // Puntos geográficos asociados
  maps?: IProjectFile[]; // archivos de tipo mapa
  images?: IProjectFile[]; // imágenes asociadas
  analysisFiles?: IProjectFile[]; // archivos de análisis
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number; // ID del usuario que creó el período
}

export interface IPeriodCreate {
  projectId: number;
  periodName: string;
  startDate: string;
  endDate: string;
  volume?: string;
  startTime?: string;
  width?: string;
  maxDepth?: string;
  notes?: string;
  kmlFileId?: string; // ID del archivo KML principal
}

export interface IPeriodUpdate {
  periodName?: string;
  startDate?: string;
  endDate?: string;
  volume?: string;
  startTime?: string;
  width?: string;
  maxDepth?: string;
  notes?: string;
  kmlFileId?: string; // ID del archivo KML principal
}

export interface IPeriodAnalysis {
  periodId: number;
  dataPoints: {
    position: string;
    depth: number;
    flow: number;
    temperature?: number;
    timestamp: string;
  }[];
  summaryStats: {
    avgDepth: number;
    maxDepth: number;
    avgFlow: number;
    maxFlow: number;
    avgTemperature?: number;
  };
}
