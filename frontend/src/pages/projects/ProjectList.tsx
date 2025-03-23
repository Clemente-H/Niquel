import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Settings, BarChart, Clock, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { IProject, ProjectStatus, UserRole } from '../../types';

const ProjectList: React.FC = () => {
  // Estado para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para proyectos
  const [projects, setProjects] = useState<IProject[]>([]);

  // Mock del rol de usuario (esto vendría del contexto de autenticación)
  const userRole: UserRole = 'admin'; // Puede ser 'admin', 'manager', o 'regular'

  // Determinar si mostrar opciones de admin/manager
  const hasAdminAccess = userRole === "admin" || userRole === "manager";

  // Cargar proyectos al iniciar
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Simular llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Datos dummy para los proyectos
        const projectsData: IProject[] = [
          { id: 1, name: "Canal Los Andes", description: "Proyecto de monitoreo y mantenimiento...", location: "Sector Norte", owner: "Carlos Méndez", status: "En progreso", startDate: "2024-10-15", lastUpdate: "2025-03-18", type: "Hidrología" },
          { id: 2, name: "Gestión Hídrica Río Mapocho", description: "Proyecto de conservación...", location: "Sector Este", owner: "María González", status: "Completado", startDate: "2024-09-01", lastUpdate: "2025-03-15", type: "Conservación" },
          { id: 3, name: "Monitoreo Cuenca del Maipo", description: "Sistema de monitoreo...", location: "Zona Central", owner: "Juan Rodríguez", status: "Planificación", startDate: "2024-11-01", lastUpdate: "2025-03-10", type: "Monitoreo" },
          { id: 4, name: "Análisis Pluvial Sierra Bella", description: "Estudio pluvial...", location: "Cordillera", owner: "Ana Martínez", status: "En progreso", startDate: "2024-10-05", lastUpdate: "2025-03-05", type: "Análisis" },
          { id: 5, name: "Restauración Canal San Carlos", description: "Proyecto de restauración...", location: "Región Metropolitana", owner: "Pedro López", status: "En revisión", startDate: "2024-08-15", lastUpdate: "2025-02-28", type: "Restauración" },
        ];

        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filtrar proyectos según términos de búsqueda y filtros
  const filteredProjects = projects.filter(project => {
    // Filtro por término de búsqueda
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.owner.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por tipo
    const matchesType = selectedType === 'all' || project.type === selectedType;

    // Filtro por estado
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Tipos de proyecto para el filtro
  const projectTypes = ['Hidrología', 'Conservación', 'Monitoreo', 'Análisis', 'Restauración'];

  // Estados de proyecto para el filtro
  const projectStatuses = ['Planificación', 'En progreso', 'En revisión', 'Completado'];

  return (
    <div>
      <Card
        title="Proyectos"
        icon={<BarChart size={24} className="text-blue-600" />}
        isLoading={isLoading}
        actions={
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar proyecto..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
            </div>

            {hasAdminAccess && (
              <Button
                variant="primary"
                leftIcon={<PlusCircle size={18} />}
                as={Link}
                to="/projects/new"
              >
                Añadir Proyecto
              </Button>
            )}
          </div>
        }
      >
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proyecto</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {projectStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de proyectos */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nombre</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Ubicación</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Responsable</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Tipo</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Última actualización</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline font-medium">
                      {project.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{project.location}</td>
                  <td className="py-3 px-4">{project.owner}</td>
                  <td className="py-3 px-4">{project.type}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={project.status as ProjectStatus} />
                  </td>
                  <td className="py-3 px-4 flex items-center">
                    <Clock size={14} className="mr-1 text-gray-400" />
                    {project.lastUpdate}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {hasAdminAccess && (
                        <Link
                          to={`/projects/${project.id}/edit`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Settings size={16} />
                        </Link>
                      )}
                      <Link
                        to={`/projects/${project.id}`}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje si no hay proyectos */}
        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron proyectos que coincidan con los criterios de búsqueda.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectList;
