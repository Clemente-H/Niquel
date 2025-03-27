import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Settings, BarChart, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { IProject, ProjectStatus, UserRole } from '../../types';
import { useAuth } from '../../store/AuthContext';
import { projectService } from '../../services';

/**
 * Props para el componente Dashboard
 */
interface IDashboardProps {
  // Props específicas si son necesarias
}

/**
 * Página principal del Dashboard
 * Muestra una lista de proyectos con opciones de filtrado y búsqueda
 */
const Dashboard: React.FC<IDashboardProps> = () => {
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estado para proyectos y carga
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener información del usuario autenticado
  const { user } = useAuth();
  const userRole = user?.role as UserRole;

  // Determinar si mostrar opciones de admin/manager
  const hasAdminAccess = userRole === "admin" || userRole === "manager";

  // Cargar proyectos al iniciar
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Obtener proyectos desde la API
        const response = await projectService.getProjects();
        setProjects(response.items);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("No se pudieron cargar los proyectos. Por favor, intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filtrar proyectos según término de búsqueda
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Link to="/projects/new">
                <Button
                  variant="primary"
                  leftIcon={<PlusCircle size={18} />}
                  className="w-full"
                >
                  Añadir Proyecto
                </Button>
              </Link>
            )}
          </div>
        }
      >
        {/* Mensaje de error si ocurrió un problema */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabla de proyectos */}
        {!isLoading && filteredProjects.length > 0 && (
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
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-3 px-4">{project.name}</td>
                    <td className="py-3 px-4">{project.location}</td>
                    <td className="py-3 px-4">{project.owner}</td>
                    <td className="py-3 px-4">{project.type}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={project.status as ProjectStatus} />
                    </td>
                    <td className="py-3 px-4 flex items-center">
                      <Clock size={14} className="mr-1 text-gray-400" />
                      {project.lastUpdate || project.updatedAt}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {hasAdminAccess && (
                          <>
                            <Link
                              to={`/projects/${project.id}/edit`}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar"
                            >
                              <Settings size={16} />
                            </Link>
                          </>
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
        )}

        {/* Mensaje si no hay proyectos */}
        {!isLoading && filteredProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "No se encontraron proyectos que coincidan con la búsqueda."
              : "No hay proyectos disponibles. Crea un nuevo proyecto con el botón 'Añadir Proyecto'."}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
