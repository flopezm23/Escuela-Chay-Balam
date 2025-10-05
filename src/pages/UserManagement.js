import React, { useState, useEffect } from "react";
import "./UserManagement.css";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useApi } from "../hooks/useApi";

const UserManagement = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    contrasenia: "",
    rol: "Docente",
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await callApi(() => authService.getUsers());
      if (response && Array.isArray(response)) {
        setUsers(response);
      }
    } catch (err) {
      // Error manejado por useApi
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await callApi(
        () => authService.createUser(formData),
        "Usuario creado exitosamente"
      );

      // Limpiar formulario
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        contrasenia: "",
        rol: "Docente",
      });

      // Recargar lista de usuarios
      await loadUsers();
    } catch (err) {
      // Error manejado por useApi
    }
  };

  const handleResetPassword = async (userEmail) => {
    if (!window.confirm(`¿Reiniciar contraseña de ${userEmail}?`)) return;

    try {
      await callApi(
        () => authService.resetPassword(userEmail),
        "Solicitud de reinicio enviada"
      );
    } catch (err) {
      // Error manejado por useApi
    }
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      Administrador: "badge-admin",
      Docente: "badge-docente",
      Estudiante: "badge-estudiante",
    };

    return (
      <span className={`role-badge ${roleClasses[role] || ""}`}>{role}</span>
    );
  };

  return (
    <div className="user-management-container">
      <h1>Gestión de Usuarios</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="user-management-content">
        {/* Formulario de creación */}
        <div className="user-form-section">
          <h2>Crear Nuevo Usuario</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Apellido:</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Contraseña Temporal:</label>
                <input
                  type="password"
                  name="contrasenia"
                  value={formData.contrasenia}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rol:</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="Docente">Docente</option>
                <option value="Administrador">Administrador</option>
                <option value="Estudiante">Estudiante</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </form>
        </div>

        {/* Lista de usuarios */}
        <div className="users-list-section">
          <h2>Usuarios Registrados ({users.length})</h2>
          {loading && users.length === 0 ? (
            <p className="loading-message">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="no-data">No hay usuarios registrados</p>
          ) : (
            <div className="users-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id}>
                      <td>
                        {userItem.nombre} {userItem.apellido}
                      </td>
                      <td>{userItem.email}</td>
                      <td>{getRoleBadge(userItem.rol)}</td>
                      <td>
                        <button
                          className="btn-reset"
                          onClick={() => handleResetPassword(userItem.email)}
                          disabled={loading}
                        >
                          Reiniciar Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
