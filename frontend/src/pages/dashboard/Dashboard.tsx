import React, { useState } from 'react';
import { Search, PlusCircle, Settings, BarChart, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { IProject, ProjectStatus, UserRole } from '../../types';

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
  
  // Mock del rol de usuario (esto vendría del contexto de autenticación)
  const userRole: UserRole = 'admin'; // Puede ser 'admin', 'manager', o 'regular'
  
  // Determinar si mostrar opciones de admin/manager
  const hasAdminAccess = userRole === "admin" || userRole === "manager";
  
  // Datos dummy para los proyectos (esto vendría de una llamada a la API)
  const projectsData: IProject[] = [
    { id: 1, name: "Canal Los Andes", description: "", location: "Sector Norte", owner: "Carlos Méndez", status: "En progreso", startDate: "2024-10-15", lastUpdate: "2025-03-18", type: "Hidrología" },
    { id: 2, name: "Gestión Hídrica Río Mapocho", description: "", location: "Sector Este", owner: "María González", status: "Completado", startDate: "2024-09-01", lastUpdate: "2025-03-15", type: "Conservación" },
    { id: 3, name: "Monitoreo Cuenca del Maipo", description: "", location: "Zona Central", owner: "Juan Rodríguez", status: "Planificación", startDate: "2024-11-01", lastUpdate: "2025-03-10", type: "Monitoreo" },
    { id: 4, name: "Análisis Pluvial Sierra Bella", description: "", location: "Cordillera", owner: "Ana Martínez", status: "En progreso", startDate: "2024-10-05", lastUpdate: "2025-03-05", type: "Análisis" },
    { id: 5, name: "Restauración Canal San Carlos", description: "", location: "Región Metropolitana", owner: "Pedro López", status: "En revisión", startDate: "2024-08-15", lastUpdate: "2025-02-28", type: "Restauración" },
  ];
  
  // Filtrar proyectos según término de búsqueda
  const filteredProjects = projectsData.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Card
        title="Proyectos"
        icon={<BarChart size={24} className="text-blue-600" />}
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
                    {project.lastUpdate}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {hasAdminAccess && (
                        <>
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Settings size={16} />
                          </button>
                        </>
                      )}
                      <Link to={`/projects/${project.id}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
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
        {filteredProjects.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No se encontraron proyectos que coincidan con la búsqueda.
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;