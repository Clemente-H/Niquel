# Plan de Integración: Sistema de Visualización Geoespacial para Proyectos y Periodos

## Resumen Ejecutivo

Este documento define el plan para integrar funcionalidades de visualización geoespacial en la aplicación actual, permitiendo a los usuarios trabajar con archivos KML/KMZ, visualizar puntos de interés con diferentes niveles de gravedad (verde, amarillo, rojo) y asociar imágenes específicas a esos puntos. La implementación se dividirá en cuatro fases principales, diseñadas para proporcionar valor incremental mientras se mantiene la estabilidad del sistema existente.

## Objetivo

Integrar un sistema de visualización de mapas KML/KMZ que permita:
- Mostrar mapas con rutas/caminos (LineStrings) del archivo KML/KMZ
- Añadir puntos de interés con indicadores de gravedad (verde, amarillo, rojo)
- Visualizar detalles e imágenes asociadas a cada punto al hacer clic en ellos
- Editar y gestionar estos puntos y sus características

## Arquitectura Técnica

### Componentes Principales:
1. **Backend**: FastAPI con nuevos endpoints para gestión de archivos KML/KMZ y puntos geográficos
2. **Base de Datos**: Nuevos modelos para GeoPoints y relaciones con imágenes
3. **Frontend**: Implementación de visualizador de mapas usando Leaflet o Mapbox
4. **Almacenamiento**: Sistema mejorado para archivos KML/KMZ e imágenes

## Plan de Implementación

### Fase 1: Infraestructura Base

#### ✅ Paso 1: Ampliación del Modelo de Datos

**Backend - Modelos** ✅
- ✅ Crear modelo `GeoPoint` con campos:
  - ID
  - Coordenadas (latitud, longitud)
  - Nivel de gravedad (1-verde, 2-amarillo, 3-rojo)
  - Descripción
  - Referencias a imágenes
  - Relación con Period
  - Metadatos (km, tramo, etc.)

- ✅ Actualizar modelo `Period`:
  - Añadir referencia a archivo KML/KMZ principal
  - Establecer relación one-to-many con GeoPoints

**Base de Datos - Migraciones** ✅
- Crear migraciones para los nuevos modelos
- Establecer índices geoespaciales si es necesario

#### ✅ Paso 2: Servicios y Procesamiento de Archivos

**Backend - Servicios** ✅
- ✅ Implementar servicios para puntos geográficos:
  - Operaciones CRUD para GeoPoint
  - Gestión de imágenes asociadas
  - Consultas por período

**Servicios implementados:**
- `geo_point_service.py` - Para gestionar puntos geográficos
- `geo_point_image_service.py` - Para gestionar imágenes de puntos

**Pendiente para la siguiente fase:**
- Implementar procesador de archivos KML/KMZ:
  - Extracción de archivo KMZ si es necesario
  - Parseo del KML para identificar LineStrings y coordenadas
  - Validación del formato y estructura

### Fase 2: APIs y Endpoints

#### ✅ Paso 1: CRUD de Puntos Geográficos

**Backend - Endpoints** ✅
- ✅ Implementar endpoints para gestión de GeoPoints:
  ```
  GET    /api/periods/{period_id}/geo-points
  POST   /api/periods/{period_id}/geo-points
  GET    /api/geo-points/{geopoint_id}
  PUT    /api/geo-points/{geopoint_id}
  DELETE /api/geo-points/{geopoint_id}
  ```

- ✅ Mejorar endpoint de Period para manejar archivos KML/KMZ:
  ```
  POST /api/projects/{project_id}/periods
  PUT  /api/periods/{period_id}
  ```

#### ✅ Paso 2: API para Relación Puntos-Imágenes

**Backend - Endpoints** ✅
- ✅ Implementar endpoints para asociar imágenes con puntos:
  ```
  POST /api/geo-points/{geopoint_id}/images
  GET  /api/geo-points/{geopoint_id}/images
  DELETE /api/geo-points/{geopoint_id}/images/{image_id}
  ```

- ✅ Mejorar servicio de archivos para manejar metadatos extendidos

**Implementado:**
- API completo para gestión de puntos geográficos
- API para gestión de imágenes asociadas a puntos
- Actualización de endpoints de periodos para manejar archivos KML

### Fase 3: Implementación Frontend

#### Paso 1: Componente de Visualización de Mapas

**Frontend - Componentes**
- Crear componente `MapViewer`:
  - Integrar biblioteca Leaflet
  - Implementar carga y renderizado de archivos KML/KMZ
  - Crear sistema de estilos para puntos según nivel de gravedad

```typescript
// Ejemplo de estructura del componente MapViewer
interface MapViewerProps {
  kmlUrl: string;
  geoPoints: GeoPoint[];
  onPointClick: (point: GeoPoint) => void;
  editable?: boolean;
}
```

#### Paso 2: Interacción con Puntos y UI de Edición

**Frontend - Componentes**
- Desarrollar componente `GeoPointDetails`:
  - Mostrar información detallada del punto
  - Galería de imágenes asociadas
  - Controles para editar propiedades

- Implementar modal `GeoPointEditor`:
  - Formulario para añadir/editar puntos
  - Selector de nivel de gravedad
  - Interfaz para asociar imágenes

- Mejorar `PeriodForm` y `PeriodDetail` para integrar nuevos componentes

### Fase 4: Integración y Refinamiento

#### Paso 1: Integración con Flujo de Períodos

**Frontend - Integración**
- Actualizar `PeriodForm` para permitir:
  - Carga de archivos KML/KMZ
  - Creación y edición de puntos geográficos
  - Asociación de imágenes a puntos

- Modificar `PeriodDetail` para:
  - Mostrar mapa con puntos de colores
  - Permitir interacción con puntos
  - Visualizar detalles e imágenes al hacer clic

#### Paso 2: Optimización y Pruebas

**Sistema Completo**
- Optimizar rendimiento:
  - Carga progresiva para mapas grandes
  - Caché de imágenes y datos geoespaciales
  - Consultas eficientes para puntos visibles

- Realizar pruebas exhaustivas:
  - Pruebas de carga
  - Compatibilidad de navegadores
  - Experiencia en dispositivos móviles

## Detalles Técnicos

### Estructura de Archivos (Frontend)

```
src/
├── components/
│   ├── maps/
│   │   ├── MapViewer.tsx
│   │   ├── GeoPointMarker.tsx
│   │   ├── GeoPointDetails.tsx
│   │   └── GeoPointEditor.tsx
│   └── ...
├── services/
│   ├── geoPointService.ts
│   └── ...
├── types/
│   ├── geoPoint.types.ts
│   └── ...
└── ...
```

### Nuevos Tipos TypeScript

```typescript
// geoPoint.types.ts
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
}

export interface IGeoPointImage {
  id: string;
  url: string;
  fileName: string;
  geoPointId: string;
  uploadedAt: string;
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
```

### Modelo de Datos (Backend)

```python
# models/geo_point.py
class GeoPoint(Base):
    """Modelo para puntos geográficos en mapas."""

    __tablename__ = "geo_point"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    gravity_level: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    kilometer: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    section: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    period_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("period.id", ondelete="CASCADE"), nullable=False
    )
    period: Mapped["Period"] = relationship("Period", back_populates="geo_points")

    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    created_by_user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[created_by]
    )

    images: Mapped[List["GeoPointImage"]] = relationship(
        "GeoPointImage", back_populates="geo_point", cascade="all, delete-orphan"
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now
    )
```

### Servicios en el Backend

```python
# services/geo_point_service.py
async def create_geo_point(
    db: AsyncSession,
    geo_point_data: GeoPointCreate,
    created_by: UUID
) -> GeoPoint:
    """
    Crear un nuevo punto geográfico.
    """
    geo_point = GeoPoint(
        latitude=geo_point_data.latitude,
        longitude=geo_point_data.longitude,
        gravity_level=geo_point_data.gravity_level,
        description=geo_point_data.description,
        kilometer=geo_point_data.kilometer,
        section=geo_point_data.section,
        period_id=geo_point_data.period_id,
        created_by=created_by,
    )

    db.add(geo_point)
    await db.commit()
    await db.refresh(geo_point)

    return geo_point
```

## Requisitos y Dependencias

### Frontend
- Leaflet (o Mapbox GL JS)
- React Leaflet
- React Image Gallery (para visualización de imágenes)

### Backend
- GeoPandas (para procesamiento de datos geoespaciales)
- Shapely (para manipulación de geometrías)
- GDAL/OGR (opcional, para procesamiento avanzado de formatos geoespaciales)

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Archivos KML/KMZ muy grandes que causan problemas de rendimiento | Media | Alto | Implementar procesamiento por lotes y carga progresiva |
| Incompatibilidad entre diferentes formatos KML/KMZ | Alta | Medio | Desarrollar validador robusto y normalizar a formato estándar |
| Problemas de precisión en cálculos geoespaciales | Media | Alto | Utilizar proyecciones adecuadas y verificar cálculos con herramientas especializadas |
| Dificultad para compartir mapas con usuarios sin permisos | Media | Medio | Implementar sistema de enlaces compartidos con permisos temporales |

## Métricas de Éxito

1. **Rendimiento**: Carga de mapas < 3 segundos para archivos de tamaño medio
2. **Usabilidad**: 90% de tareas completadas con éxito en pruebas de usuario
3. **Compatibilidad**: Funciona correctamente en Chrome, Firefox, Safari y Edge
4. **Adopción**: 80% de los usuarios activos utilizan la nueva funcionalidad en el primer mes

## Conclusión

Este plan de integración permite añadir capacidades avanzadas de visualización geoespacial a la aplicación existente de forma estructurada y progresiva. Las fases están diseñadas para ofrecer valor incremental mientras se minimizan los riesgos de disrupciones en el sistema actual.
