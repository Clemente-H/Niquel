import { IUser } from './user.types';
import { IPeriod } from './period.types';

export type ProjectStatus = 'Planificación' | 'En progreso' | 'En revisión' | 'Completado';

export type ProjectType = 'Hidrología' | 'Conservación' | 'Monitoreo' | 'Análisis' | 'Restauración';

export interface IProject {
  id: number;
  name: string;
  description: string;
  location: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  owner: string; // podría ser IUser.id o un nombre
  ownerId?: number;
  lastUpdate?: string;
  team?: IUser[];
  periods?: IPeriod[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IProjectCreate {
  name: string;
  description: string;
  location: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  ownerId: number;
}

export interface IProjectUpdate {
  name?: string;
  description?: string;
  location?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  startDate?: string;
  ownerId?: number;
}

export interface IProjectFile {
  id: number;
  projectId: number;
  name: string;
  type: string;
  size: number;
  url: string;
  category?: 'map' | 'image' | 'document' | 'analysis';
  uploadedBy: number; // IUser.id
  uploadedAt: string;
}