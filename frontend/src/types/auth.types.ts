import { IUser, UserRole } from './user.types';

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  name: string;
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  refreshToken?: string;
  user: IUser;
  expiresAt?: string;
}

export interface IAuthContext {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: ILoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: IRegisterData) => Promise<void>;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
}

export interface IJwtPayload {
  sub: string; // ID del usuario
  email: string;
  role: UserRole;
  exp: number; // timestamp de expiración
  iat: number; // timestamp de emisión
}