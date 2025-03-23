import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Clock, Map, ChevronLeft, Download, Users, PlusCircle, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { IProject, IPeriod, ProjectStatus, UserRole } from '../../types';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [project, setProject] = useState<IProject | null>(null);

  // Mock del rol de usuario (esto vendría del contexto de autenticación)
  const userRole: UserRole = 'admin';

  // Determinar si mostrar opciones de admin/manager
  const hasAdminAccess = userRole === "admin" || userRole === "manager";

  // Datos dummy del proyecto (esto vendría de una llamada a la API)
  useEffect(() => {
    // Simular una llamada a la API
    const fetchProject = async () => {
      try {
        // Simulación de tiempo de carga
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Datos dummy
        const projectData: IProject = {
          id: Number(id),
          name: "Canal Los Andes",
          description: "Proyecto de monitoreo y mantenimiento del Canal Los Andes, incluyendo análisis de caudal y calidad del agua en diferentes tramos.",
          location: "Sector Norte - Coordenadas: 32°50'16.8\"S 70°35'56.4\"W",
          owner: "Carlos Méndez",
          status: "En progreso" as ProjectStatus,
          startDate: "2024-10-15",
          lastUpdate: "2025-03-18",
          type: "Hidrología",
        };

        setProject(projectData);

        // Establecer el primer período como seleccionado por defecto
        if (availablePeriods.length > 0) {
          setSelectedPeriod(availablePeriods[0].id);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Períodos disponibles (dummy)
  const availablePeriods = [
    { id: "marzo-2025", name: "Marzo 2025" },
    { id: "febrero-2025", name: "Febrero 2025" },
    { id: "enero-2025", name: "Enero 2025" },
    { id: "diciembre-2024", name: "Diciembre 2024" },
    { id: "noviembre-2024", name: "Noviembre 2024" }
  ];

  // Datos de análisis por período (dummy)
  const periodData: Record<string, any> = {
    "marzo-2025": {
      volume: "0.0121 m³/s",
      start_time: "00:03:48",
      width: "417.99 m",
      max_depth: "30.9 cm",
      notes: "Incremento de sedimentos en el tramo 31"
    },
    "febrero-2025": {
      volume: "0.0118 m³/s",
      start_time: "00:04:15",
      width: "415.50 m",
      max_depth: "29.2 cm",
      notes: "Condiciones normales en todos los tramos"
    }
  };

  // Datos del período actual
  const currentPeriodData = selectedPeriod ? periodData[selectedPeriod] : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Proyecto no encontrado</h2>
        <p className="text-gray-600 mb-4">El proyecto que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de navegación con acciones */}
      <div className="flex justify-between items-center">
        <Link
          to="/dashboard"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Volver</span>
        </Link>

        <div className="space-x-2">
          <Button
            variant="secondary"
            leftIcon={<Download size={16} />}
          >
            Generar PDF
          </Button>

          {hasAdminAccess && (
            <Button
              variant="secondary"
              leftIcon={<Users size={16} />}
            >
              Gestionar Accesos
            </Button>
          )}
        </div>
      </div>

      {/* Panel de información general */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{project.name}</h2>
            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-gray-700">Información General</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium text-gray-600 mr-2">Ubicación:</span>
                    <span>{project.location}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-gray-600 mr-2">Tipo:</span>
                    <span>{project.type}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-gray-600 mr-2">Responsable:</span>
                    <span>{project.owner}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Estado y Fechas</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center">
                    <span className="font-medium text-gray-600 mr-2">Estado:</span>
                    <StatusBadge status={project.status} />
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-gray-600 mr-2">Fecha inicio:</span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1 text-gray-400" />
                      {project.startDate}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-gray-600 mr-2">Última actualización:</span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1 text-gray-400" />
                      {project.lastUpdate}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">Equipo</h3>
              <div className="flex flex-wrap mt-2">
                {project.team ? (
                  project.team.map((member, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                      {member.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No hay miembros asignados a este proyecto.</span>
                )}
              </div>
            </div>
          </div>

          {/* Selector de períodos */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <Clock size={18} className="mr-2" />
              Seleccionar Período
            </h3>

            <div className="mb-4">
              <select
                className="w-full p-2 border border-gray-300 rounded bg-white"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {availablePeriods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                  </option>
                ))}
              </select>
            </div>

            {hasAdminAccess && (
              <Button
                variant="primary"
                className="w-full"
                leftIcon={<PlusCircle size={16} />}
                as={Link}
                to={`/projects/${id}/periods/new`}
              >
                Añadir Nuevo Período
              </Button>
            )}

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Información del Período</h4>
              {currentPeriodData ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Volumen:</span>
                    <span className="font-medium">{currentPeriodData.volume}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Hora inicio:</span>
                    <span className="font-medium">{currentPeriodData.start_time}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Ancho:</span>
                    <span className="font-medium">{currentPeriodData.width}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Profundidad máx:</span>
                    <span className="font-medium">{currentPeriodData.max_depth}</span>
                  </li>
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">No hay datos disponibles para este período.</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Mapa */}
      <Card
        title={`Mapa de Recorrido - ${availablePeriods.find(p => p.id === selectedPeriod)?.name || 'Sin período seleccionado'}`}
        icon={<Map size={18} className="mr-2" />}
      >
        <div className="bg-gray-100 p-4 rounded-md">
          <div className="relative h-96 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
            <p className="text-gray-500">Vista previa del mapa no disponible</p>

            {/* Marcadores (solo visuales) */}
            <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              I
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              F
            </div>

            {/* Info de tramo */}
            <div className="absolute right-4 top-4 bg-white p-3 rounded shadow-md text-sm">
              <h4 className="font-bold text-gray-800">Tramo 31</h4>
              <p className="text-gray-600 mb-1">659806</p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Longitud:</span>
                <span className="font-medium">2.4 km</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Visualizaciones y análisis */}
      <Card
        title="Visualizaciones y Análisis"
        icon={<FileText size={18} className="mr-2" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gráficos de análisis (placeholders) */}
          <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-100 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">Mapa Térmico</h4>
            </div>
            <div className="p-4">
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500 text-sm">Vista previa no disponible</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-100 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">Análisis de Profundidad</h4>
            </div>
            <div className="p-4">
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500 text-sm">Vista previa no disponible</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-100 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">Flujo de Agua</h4>
            </div>
            <div className="p-4">
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500 text-sm">Vista previa no disponible</p>
              </div>
            </div>
          </div>
        </div>

        {hasAdminAccess && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
            >
              Añadir Nueva Visualización
            </Button>
          </div>
        )}
      </Card>

      {/* Panel para notas y observaciones */}
      <Card title="Notas y Observaciones">
        {currentPeriodData?.notes ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">{currentPeriodData.notes}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay notas o observaciones para este período.</p>
        )}

        {hasAdminAccess && (
          <div className="mt-4">
            <Button
              variant="secondary"
              leftIcon={<PlusCircle size={16} />}
            >
              Añadir Observación
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetail;
