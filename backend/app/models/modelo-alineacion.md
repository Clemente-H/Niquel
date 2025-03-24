# Alineación de Modelos Backend-Frontend

Este documento define la correspondencia entre los modelos del backend (Pydantic/Python) y frontend (TypeScript) para el sistema Niquel.

## Estándares Generales

- **Identificadores**: UUIDs en ambos lados (como string en frontend)
- **Fechas**: ISO8601 (YYYY-MM-DD) para intercambio
- **Tiempos**: ISO8601 (HH:MM:SS) para intercambio
- **Campos estándar**: id, created_at/createdAt, updated_at/updatedAt

## Usuario (User)

| Backend (Pydantic) | Frontend (TypeScript) | Observaciones |
|--------------------|----------------------|---------------|
| `id: UUID` | `id: string` | Cambiar a string en frontend |
| `email: str` | `email: string` | |
| `name: str` | `name: string` | |
| `role: str` | `role: UserRole` | Enum con valores: 'admin', 'manager', 'regular' |
| `is_active: bool` | `status: UserStatus` | Mapear true→'active', false→'inactive' |
| *(no existe)* | `lastLogin?: string` | Se puede agregar al backend si es necesario |
| *(no existe)* | `projects?: string[]` | Se puede obtener vía relación en el backend |
| `created_at: datetime` | `createdAt?: string` | |
| `updated_at: datetime` | `updatedAt?: string` | |

## Proyecto (Project)

| Backend (Pydantic) | Frontend (TypeScript) | Observaciones |
|--------------------|----------------------|---------------|
| `id: UUID` | `id: string` | Cambiar a string en frontend |
| `name: str` | `name: string` | |
| `description: str` | `description: string` | |
| `location: str` | `location: string` | |
| `type: str` | `type: ProjectType` | Validar mismos valores enumerados |
| `status: str` | `status: ProjectStatus` | Validar mismos valores enumerados |
| `start_date: date` | `startDate: string` | Formato ISO8601 (YYYY-MM-DD) |
| `owner_id: UUID` | `ownerId: string` | Cambiar a string en frontend |
| *(no existe)* | `owner: string` | Se puede obtener a través de la relación en backend |
| *(no existe)* | `lastUpdate?: string` | Se puede calcular a partir de updated_at |
| *(no existe)* | `team?: IUser[]` | Se puede obtener a través de relación de asignaciones |
| *(no existe)* | `periods?: IPeriod[]` | Se puede obtener a través de relación de períodos |
| `created_at: datetime` | `createdAt?: string` | |
| `updated_at: datetime` | `updatedAt?: string` | |

## Período (Period)

| Backend (Pydantic) | Frontend (TypeScript) | Observaciones |
|--------------------|----------------------|---------------|
| `id: UUID` | `id: string` | Cambiar a string en frontend |
| `project_id: UUID` | `projectId: string` | Cambiar a string en frontend |
| `name: str` | `periodName: string` | Unificar nombre del campo |
| `start_date: date` | `startDate: string` | Formato ISO8601 |
| `end_date: date` | `endDate: string` | Formato ISO8601 |
| `volume: float` | `volume?: string` | Mantener como número en frontend |
| `start_time: time` | `startTime?: string` | Formato ISO8601 (HH:MM:SS) |
| `width: float` | `width?: string` | Mantener como número en frontend |
| `max_depth: float` | `maxDepth?: string` | Mantener como número en frontend |
| `notes: str` | `notes?: string` | |
| `created_by: UUID` | `createdBy?: string` | Cambiar a string en frontend |
| *(no existe)* | `maps?: IProjectFile[]` | Filtrar por categoría en backend |
| *(no existe)* | `images?: IProjectFile[]` | Filtrar por categoría en backend |
| *(no existe)* | `analysisFiles?: IProjectFile[]` | Filtrar por categoría en backend |
| `created_at: datetime` | `createdAt?: string` | |
| `updated_at: datetime` | `updatedAt?: string` | |

## Archivo (File)

| Backend (Pydantic) | Frontend (TypeScript) | Observaciones |
|--------------------|----------------------|---------------|
| `id: UUID` | `id: string` | Cambiar a string en frontend |
| `name: str` | `name: string` | |
| `path: str` | `url: string` | Transformar path a url en APIs |
| `size: int` | `size: number` | |
| `content_type: str` | `type: string` | Unificar nombre del campo |
| `category: str` | `category?: string` | Validar mismos valores enumerados |
| `project_id: UUID` | `projectId: string` | Cambiar a string en frontend |
| `period_id: UUID` | *(no existe)* | Agregar al frontend si es necesario |
| `uploaded_by: UUID` | `uploadedBy: string` | Cambiar a string en frontend |
| `upload_date: datetime` | `uploadedAt: string` | Unificar nombre del campo |
| `created_at: datetime` | `createdAt?: string` | |
| `updated_at: datetime` | `updatedAt?: string` | |

## Asignación de Usuario (UserAssignment)

| Backend (Pydantic) | Frontend (TypeScript) | Observaciones |
|--------------------|----------------------|---------------|
| `id: UUID` | `id: string` | Agregar id en frontend |
| `user_id: UUID` | `userId: string` | Cambiar a string en frontend |
| `project_id: UUID` | `projectId: string` | Cambiar a string en frontend |
| `role: str` | `role?: string` | Validar mismos valores enumerados: 'viewer', 'editor', 'admin' |
| `assigned_at: datetime` | `assignedAt: string` | |
| `assigned_by: UUID` | *(no existe)* | Agregar al frontend si es necesario |
| `created_at: datetime` | `createdAt?: string` | |
| `updated_at: datetime` | `updatedAt?: string` | |

## Acciones Recomendadas

### Para el Backend

1. **Mantener la consistencia** de los valores de enumeraciones (tipos de proyecto, estados, roles, etc.)
2. **Implementar serialización** para transformar snake_case a camelCase en las respuestas API
3. **Implementar deserialización** para transformar camelCase a snake_case en las solicitudes API
4. **Agregar validación** para asegurar que los valores de enumeración sean consistentes

### Para el Frontend (cuando se descongelé)

1. **Cambiar los tipos de ID** de number a string
2. **Actualizar los tipos numéricos** para evitar usar strings para valores numéricos (volume, width, etc.)
3. **Implementar transformación de fechas** entre objetos Date y strings ISO8601
4. **Documentar las enumeraciones** para mantener consistencia con el backend

### Notas Adicionales

- Las diferencias en nomenclatura (snake_case vs camelCase) se manejarán a nivel de serialización/deserialización
- Campos adicionales en el frontend pueden obtenerse transformando o combinando datos del backend
- Las relaciones (como team, periods) se pueden obtener en consultas específicas desde el backend
