import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, X, Check, Users, MailOpen, Shield, Edit, Trash, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { IUser, UserRole, UserStatus, IUserCreate, IUserUpdate } from '../../types';
import { useAuth } from '../../store/AuthContext';
import { userService } from '../../services';

const UserManagement: React.FC = () => {
  // Estados
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);

  // Estado para usuarios
  const [users, setUsers] = useState<IUser[]>([]);

  // Estado para el formulario de nuevo usuario
  const [newUser, setNewUser] = useState<IUserCreate>({
    name: '',
    email: '',
    password: '',
    role: 'regular'
  });

  // Estado para usuario en edición
  const [editingUser, setEditingUser] = useState<{id: string, data: IUserUpdate} | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Obtener información del usuario autenticado
  const { user: currentUser } = useAuth();

  // Comprobar si el usuario actual tiene permisos de administrador
  const isAdmin = currentUser?.role === "admin";

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Función para cargar usuarios desde la API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calcular los parámetros para paginación
      const skip = (currentPage - 1) * itemsPerPage;

      // Llamar al servicio de usuarios
      const response = await userService.getUsers(currentPage, itemsPerPage);

      setUsers(response.items);
      setTotalUsers(response.total);
      setTotalPages(response.pages);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en el formulario de nuevo usuario
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el formulario de edición
  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        data: {
          ...editingUser.data,
          [name]: value
        }
      });
    }
  };

  // Manejar envío del formulario de nuevo usuario
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      // Llamar al servicio para crear el usuario
      const createdUser = await userService.createUser(newUser);

      // Actualizar la lista de usuarios
      await fetchUsers();

      // Cerrar el modal y limpiar formulario
      setShowAddUserModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'regular'
      });

    } catch (error: any) {
      console.error("Error adding user:", error);
      setError(error.message || "Error al crear el usuario");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Manejar envío del formulario de edición
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    setSubmitLoading(true);
    setError(null);

    try {
      // Llamar al servicio para actualizar el usuario
      await userService.updateUser(editingUser.id, editingUser.data);

      // Actualizar la lista de usuarios
      await fetchUsers();

      // Cerrar el modal y limpiar formulario
      setShowEditModal(false);
      setEditingUser(null);

    } catch (error: any) {
      console.error("Error updating user:", error);
      setError(error.message || "Error al actualizar el usuario");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Preparar para editar un usuario
  const startEditingUser = (user: IUser) => {
    setEditingUser({
      id: user.id.toString(),
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
    setShowEditModal(true);
  };

  // Manejar cambio de estado del usuario
  const handleToggleUserStatus = async (userId: number, currentStatus: UserStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      // Llamar al servicio para actualizar el estado
      await userService.toggleUserStatus(userId.toString(), newStatus === 'active');

      // Actualizar la lista de usuarios localmente para una experiencia más fluida
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      setError(error.message || "Error al cambiar el estado del usuario");
    }
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      // Llamar al servicio para eliminar el usuario
      await userService.deleteUser(userId.toString());

      // Actualizar la lista de usuarios
      await fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.message || "Error al eliminar el usuario");
    }
  };

  // Función para navegar entre páginas
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Filtrar usuarios según la pestaña seleccionada y el término de búsqueda
  const filteredUsers = users
    .filter(user =>
      selectedTab === "all" || user.role === selectedTab
    )
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div>
      <Card
        title="Gestión de Usuarios"
        icon={<Users size={24} className="text-blue-600" />}
        isLoading={isLoading}
      >
        {/* Cabecera con búsqueda y botón de añadir */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <p className="text-gray-600 mb-4 sm:mb-0">
            Administra usuarios y sus permisos en el sistema
          </p>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuario..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {isAdmin && (
              <Button
                variant="primary"
                leftIcon={<PlusCircle size={18} />}
                onClick={() => setShowAddUserModal(true)}
              >
                Añadir Usuario
              </Button>
            )}
          </div>
        </div>

        {/* Mostrar mensaje de error */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Pestañas para filtrar por tipo de usuario */}
        <div className="flex overflow-x-auto mb-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${selectedTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSelectedTab('all')}
          >
            Todos
          </button>
          <button
            className={`px-4 py-2 font-medium ${selectedTab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSelectedTab('admin')}
          >
            Administradores
          </button>
          <button
            className={`px-4 py-2 font-medium ${selectedTab === 'manager' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSelectedTab('manager')}
          >
            Managers
          </button>
          <button
            className={`px-4 py-2 font-medium ${selectedTab === 'regular' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSelectedTab('regular')}
          >
            Regulares
          </button>
        </div>

        {/* Tabla de usuarios */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nombre</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Rol</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Último acceso</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 flex items-center">
                    <MailOpen size={14} className="mr-1 text-gray-400" />
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        user.role === 'admin' ? 'bg-red-500' :
                        user.role === 'manager' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <span className={`${
                        user.role === 'admin' ? 'text-red-700' :
                        user.role === 'manager' ? 'text-yellow-700' :
                        'text-green-700'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' :
                         user.role === 'manager' ? 'Manager' :
                         'Regular'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{user.lastLogin || 'Nunca'}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {isAdmin && (
                        <>
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                            onClick={() => startEditingUser(user)}
                          >
                            <Edit size={16} />
                          </button>
                          {user.role !== 'admin' && currentUser?.id !== user.id && (
                            <button
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Eliminar"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash size={16} />
                            </button>
                          )}
                          <button
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                            title={user.status === 'active' ? 'Desactivar' : 'Activar'}
                            onClick={() => handleToggleUserStatus(user.id, user.status)}
                          >
                            {user.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </>
                      )}
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Ver proyectos"
                      >
                        <Shield size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje si no hay usuarios */}
        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron usuarios que coincidan con los criterios de búsqueda.
          </div>
        )}

        {/* Paginación */}
        {filteredUsers.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{filteredUsers.length}</span> de <span className="font-medium">{totalUsers}</span> usuarios
            </div>

            <div className="flex space-x-1">
              <button
                className={`px-3 py-1 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={`px-3 py-1 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal para añadir usuario */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Añadir Nuevo Usuario</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddUserModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese nombre completo"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="********"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Rol</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar rol</option>
                  <option value="admin">Administrador</option>
                  <option value="manager">Manager</option>
                  <option value="regular">Regular</option>
                </select>
              </div>

              <div className="flex items-center mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddUserModal(false)}
                  type="button"
                  className="mr-2"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  leftIcon={<Check size={18} />}
                  isLoading={submitLoading}
                >
                  Guardar Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar usuario */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Editar Usuario</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={editingUser.data.name || ''}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese nombre completo"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.data.email || ''}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Contraseña (opcional)</label>
                <input
                  type="password"
                  name="password"
                  value={editingUser.data.password || ''}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Rol</label>
                <select
                  name="role"
                  value={editingUser.data.role || ''}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Manager</option>
                  <option value="regular">Regular</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Estado</label>
                <select
                  name="status"
                  value={editingUser.data.status || ''}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div className="flex items-center mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  type="button"
                  className="mr-2"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  leftIcon={<Check size={18} />}
                  isLoading={submitLoading}
                >
                  Actualizar Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
