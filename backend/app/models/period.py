# app/models/period.py
from typing import List, Optional
from datetime import date, time
from uuid import UUID
from pydantic import BaseModel

# NO USAR from app.models.geo_point import GeoPoint
# en este archivo para evitar importaciones circulares


# Definición básica que no causa importaciones circulares
class Period(BaseModel):
    """Schema for Period responses."""

    id: UUID
    project_id: UUID
    name: str
    start_date: date
    end_date: date
    volume: Optional[float] = None
    start_time: Optional[time] = None
    width: Optional[float] = None
    max_depth: Optional[float] = None
    notes: Optional[str] = None
    created_by: Optional[UUID] = None
    kml_file_id: Optional[UUID] = None

    # Definir configuración del modelo
    model_config = {"from_attributes": True}


# Solución para el problema de PaginatedPeriods
class PaginatedPeriods(BaseModel):
    """Schema for paginated period responses."""

    items: List[Period]
    total: int
    page: int
    page_size: int
    pages: int

    # Definir configuración del modelo
    model_config = {"from_attributes": True}


# Period con detalles adicionales
class PeriodWithDetails(Period):
    """Schema for Period with additional details."""

    file_count: int

    # Definir configuración del modelo
    model_config = {"from_attributes": True}


# Definiciones para creación y actualización
class PeriodCreate(BaseModel):
    """Schema for creating a new period."""

    name: str
    start_date: date
    end_date: date
    project_id: UUID
    volume: Optional[float] = None
    start_time: Optional[time] = None
    width: Optional[float] = None
    max_depth: Optional[float] = None
    notes: Optional[str] = None
    kml_file_id: Optional[UUID] = None

    # Definir configuración del modelo
    model_config = {"from_attributes": True}


class PeriodUpdate(BaseModel):
    """Schema for updating a period."""

    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    volume: Optional[float] = None
    start_time: Optional[time] = None
    width: Optional[float] = None
    max_depth: Optional[float] = None
    notes: Optional[str] = None
    kml_file_id: Optional[UUID] = None

    # Definir configuración del modelo
    model_config = {"from_attributes": True}
