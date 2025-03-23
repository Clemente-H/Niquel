import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, X, Check, Users, MailOpen, Shield, Edit, Trash, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { IUser, UserRole, UserStatus } from '../../types';

const UserManagement: React.FC = () => {
  // Estados
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para usuarios
  const [users, setUsers] = useState<IUser[]>([]);

  // Estado para el formulario de nuevo usuario
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'regular'
  });

  // Mock del rol de usuario actual
  const currentUserRole: UserRole = 'admin';

  // Comprobar si el usuario actual tiene permisos de administrador
  const isAdmin = currentUserRole === "admin";

  // Cargar usuarios al iniciar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simular llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Datos dummy para usuarios
        const usersData: IUser[] = [
          { id: 1, name: "Carlos Méndez", email: "carlos@ejemplo.com", role: 'admin', status: 'active', lastLogin: "2025-03-20" },
          { id: 2, name: "María González", email: "maria@ejemplo.com", role: 'manager', status: 'active', lastLogin: "2025-03-19" },
          { id: 3, name: "Juan Rodríguez", email: "juan@ejemplo.com", role: 'regular', status: 'active', lastLogin: "2025-03-18" },
          { id: 4, name: "Ana Martínez", email: "ana@ejemplo.com", role: 'regular', status: 'active', lastLogin: "2025-03-15" },
          { id: 5, name: "Pedro López", email: "pedro@ejemplo.com", role: 'regular', status: 'inactive', lastLogin: "2025-02-28" },
          { id: 6, name: "Laura Sánchez", email: "laura@ejemplo.com", role: 'manager', status: 'active', lastLogin: "2025-03-17" }
        ];

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Manejar cambios en el formulario de nuevo usuario
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario de nuevo usuario
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Simular envío a la API
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simular adición del nuevo usuario
      const newId = users.length + 1;
      const userToAdd: IUser = {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserRole,
        status: 'active',
        lastLogin: ''
      };

      setUsers(prev => [...prev, userToAdd]);
      setShowAddUserModal(false);

      // Resetear formulario
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'regular'
      });

    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Manejar cambio de estado del usuario
  const handleToggleUserStatus = (userId: number) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = (userId: number) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
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
                          >
                            <Edit size={16} />
                          </button>
                          {user.role !== 'admin' && (
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
                            onClick={() => handleToggleUserStatus(user.id)}
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
              Mostrando <span className="font-medium">{filteredUsers.length}</span> usuarios
            </div>

            <div className="flex space-x-1">
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Anterior
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
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
                >
                  Guardar Usuario
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
