import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, X, Upload, Map, Users, Calendar, Compass, FileText, Info } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { IProjectCreate, IProject, ProjectStatus, ProjectType, UserRole, IUser } from '../../types';
import { useAuth } from '../../store/AuthContext';
import { projectService, userService, assignmentService } from '../../services';

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProject, setLoadingProject] = useState<boolean>(false);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);

  // Estado para el formulario
  const [formData, setFormData] = useState<IProjectCreate>({
    name: '',
    description: '',
    location: '',
    type: 'Hidrología',
    status: 'Planificación',
    startDate: new Date().toISOString().split('T')[0],
    ownerId: 0 // Default owner ID, se actualizará con el usuario actual
  });

  // Estado para archivos seleccionados
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Estado para usuarios asignados al proyecto
  const [assignedUsers, setAssignedUsers] = useState<IUser[]>([]);

  // Obtener información del usuario autenticado
  const { user } = useAuth();

  // Establecer el ID del usuario actual como owner por defecto
  useEffect(() => {
    if (user && user.id && !isEditing) {
      setFormData(prev => ({
        ...prev,
        ownerId: user.id
      }));
    }
  }, [user, isEditing]);

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role !== 'admin' && user?.role !== 'manager') return;

      setLoadingUsers(true);
      try {
        const response = await userService.getUsers();
        setAvailableUsers(response.items);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user?.role]);

  // Cargar datos del proyecto si estamos en modo edición
  useEffect(() => {
    if (isEditing && id) {
      const fetchProject = async () => {
        setLoadingProject(true);
        setError(null);

        try {
          // Cargar datos del proyecto
          const projectData = await projectService.getProjectById(id);

          // Actualizar formulario con datos del proyecto
          setFormData({
            name: projectData.name,
            description: projectData.description || '',
            location: projectData.location || '',
            type: projectData.type || 'Hidrología',
            status: projectData.status || 'Planificación',
            startDate: projectData.startDate || new Date().toISOString().split('T')[0],
            ownerId: projectData.ownerId || user?.id || 0
          });

          // Cargar asignaciones del proyecto
          try {
            const assignmentsResponse = await assignmentService.getProjectAssignments(id);
            const userIds = assignmentsResponse.items.map(assignment => assignment.userId);
            if (userIds.length > 0) {
              const usersPromises = userIds.map(userId =>
                userService.getUserById(userId.toString())
              );
              const usersData = await Promise.all(usersPromises);
              setAssignedUsers(usersData.filter(Boolean)); // Filtramos posibles valores null
            } else {
              setAssignedUsers([]);
            }
          } catch (assignError) {
            console.error("Error fetching project assignments:", assignError);
          }

        } catch (err) {
          console.error("Error fetching project:", err);
          setError("No se pudo cargar la información del proyecto.");
        } finally {
          setLoadingProject(false);
        }
      };

      fetchProject();
    }
  }, [id, isEditing, user?.id]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileNames = Array.from(e.target.files).map(file => file.name);
      setSelectedFiles(prev => [...prev, ...fileNames]);
    }
  };

  // Manejar eliminación de archivos
  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(name => name !== fileName));
  };

  // Manejar eliminación de usuarios asignados
  const handleRemoveUser = (userId: number) => {
    setAssignedUsers(prev => prev.filter(user => user.id !== userId));
  };

  // Manejar asignación de usuarios
  const handleAssignUser = (userId: number) => {
    const userToAssign = availableUsers.find(user => user.id === userId);
    if (userToAssign && !assignedUsers.some(user => user.id === userId)) {
      setAssignedUsers(prev => [...prev, userToAssign]);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let projectId: number | string;

      if (isEditing && id) {
        // Actualizar proyecto existente
        await projectService.updateProject(id, formData);
        projectId = id;
      } else {
        // Crear nuevo proyecto
        const newProject = await projectService.createProject(formData);
        projectId = newProject.id;
      }

      // Manejar asignaciones de usuarios si es necesario
      if (assignedUsers.length > 0) {
        // Obtener IDs de usuarios asignados
        const userIds = assignedUsers.map(u => u.id);

        // Realizar asignación batch
        try {
          await assignmentService.batchAssignUsers(
            projectId.toString(),
            userIds.map(id => id.toString()),
            'viewer' // Rol por defecto
          );
        } catch (assignError) {
          console.error("Error assigning users:", assignError);
          // No interrumpimos el flujo por error en asignaciones
        }
      }

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving project:", error);
      setError("Ocurrió un error al guardar el proyecto. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de navegación con acciones */}
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/dashboard"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Volver</span>
        </Link>

        <Button
          variant="success"
          leftIcon={<Save size={16} />}
          isLoading={isLoading}
          onClick={handleSubmit}
          type="submit"
        >
          {isEditing ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
        </Button>
      </div>

      {/* Mensaje de error global */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Información Básica */}
        <Card
          title="Información Básica"
          icon={<Info size={20} className="text-blue-600" />}
          isLoading={loadingProject}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Canal Los Andes"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detalle el propósito y alcance del proyecto"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Tipo de Proyecto *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Hidrología">Hidrología</option>
                  <option value="Conservación">Conservación</option>
                  <option value="Monitoreo">Monitoreo</option>
                  <option value="Análisis">Análisis</option>
                  <option value="Restauración">Restauración</option>
                </select>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Ubicación *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Sector Norte - Coordenadas"
                    required
                  />
                  <button
                    type="button"
                    className="bg-blue-100 text-blue-600 px-3 py-2 rounded-r-md border border-l-0 border-blue-200 hover:bg-blue-200"
                  >
                    <Compass size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Responsable *
                </label>
                <select
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {user && (
                    <option value={user.id}>
                      {user.name} (Yo)
                    </option>
                  )}
                  {availableUsers
                    .filter(u => u.id !== user?.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Estado *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Planificación">Planificación</option>
                  <option value="En progreso">En progreso</option>
                  <option value="En revisión">En revisión</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Asignación de Usuarios */}
        <Card
          title="Asignación de Usuarios"
          icon={<Users size={20} className="text-blue-600" />}
          isLoading={loadingUsers}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <p className="text-gray-600 mb-3 sm:mb-0">
              Asigna usuarios que tendrán acceso a este proyecto
            </p>
            <Button
              variant="primary"
              leftIcon={<Users size={18} />}
              onClick={() => setShowUserModal(true)}
              type="button"
            >
              Asignar Usuarios
            </Button>
          </div>

          {assignedUsers.length > 0 ? (
            <div className="bg-gray-50 rounded border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'manager' ? 'Manager' : user.role === 'admin' ? 'Admin' : 'Regular'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 text-yellow-700">
              No hay usuarios asignados a este proyecto. Haz clic en el botón "Asignar Usuarios" para empezar.
            </div>
          )}
        </Card>

        {/* Carga de Archivos */}
        <Card
          title="Archivos y Recursos"
          icon={<FileText size={20} className="text-blue-600" />}
        >
          <div className="flex flex-col sm:flex-row sm:items-center mb-6">
            <p className="text-gray-600 mb-3 sm:mb-0 sm:mr-4">
              Sube archivos relacionados con el proyecto (mapas, documentos, imágenes)
            </p>
            <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center cursor-pointer">
              <Upload size={18} className="mr-2" />
              <span>Subir Archivos</span>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {selectedFiles.length > 0 ? (
            <div className="bg-gray-50 rounded border border-gray-200 p-4">
              <h3 className="font-medium text-gray-700 mb-2">Archivos seleccionados:</h3>
              <ul className="divide-y divide-gray-200">
                {selectedFiles.map((fileName, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <span className="text-blue-600">{fileName}</span>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleRemoveFile(fileName)}
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded p-8 text-center">
              <Upload size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                Arrastra archivos aquí o haz clic en "Subir Archivos"
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Formatos soportados: PDF, JPG, PNG, XLSX, KML, CSV
              </p>
            </div>
          )}
        </Card>
      </form>

      {/* Modal para seleccionar usuarios */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Asignar Usuarios al Proyecto</h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowUserModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Buscar usuario..."
                />
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableUsers.map((user) => {
                      const isAssigned = assignedUsers.some(u => u.id === user.id);
                      return (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role === 'manager' ? 'Manager' :
                               user.role === 'admin' ? 'Admin' : 'Regular'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                isAssigned
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                              onClick={() => !isAssigned && handleAssignUser(user.id)}
                              disabled={isAssigned}
                            >
                              {isAssigned ? 'Asignado' : 'Asignar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowUserModal(false)}
                  className="mr-2"
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowUserModal(false)}
                  type="button"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectForm;
