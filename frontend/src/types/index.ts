export * from './user.types';
export * from './project.types';
export * from './period.types';
export * from './auth.types';

export interface IBaseComponentProps {
  className?: string;
  [key: string]: any;
}

export interface IWithChildrenProps {
  children?: React.ReactNode;
}

export interface IWithIconProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export type Maybe<T> = T | null | undefined;
export type Callback<T = void> = (...args: any[]) => T;
export type ID = number | string;

export interface ISelectOption {
  value: string | number;
  label: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface INotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
}

export interface IPaginationParams {
  page: number;
  limit: number;
  totalPages?: number;
  totalItems?: number;
}

export interface ITableColumn<T = any> {
  id: string;
  label: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  cellRenderer?: (value: any, row: T) => React.ReactNode;
}