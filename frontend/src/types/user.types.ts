export type UserRole = 'admin' | 'manager' | 'regular';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  projects?: number[];
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUserUpdate {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
}

export interface IUserAssignment {
  userId: number;
  projectId: number;
  role?: 'viewer' | 'editor' | 'admin';
  assignedAt: string;
}
