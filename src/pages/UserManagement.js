import React, { useState, useEffect } from "react";
import "./UserManagement.css";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useApi } from "../hooks/useApi";

const UserManagement = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [users, setUsers] = useState([]);
  const [validationError, setValidationError] = useState("");
  const [formData, setFormData] = useState({
    PrimerNombre: "",
    SegundoNombre: "",
    PrimerApellido: "",
    SegundoApellido: "",
    Email: "",
    Contrasena: "",
    RolID: 2, // Valor por defecto: 2 (Profesor)
  });

  // Mapeo de roles con IDs
  const roles = [
    { id: 1, nombre: "Administrador" },
    { id: 2, nombre: "Profesor" },
    { id: 3, nombre: "Alumno" },
    { id: 4, nombre: "Personal de Desarrollo" },
    { id: 5, nombre: "Coordinador" },
  ];

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Enviar JSON vacío para obtener todos los usuarios
      const response = await callApi(() => authService.getUsers({}));
      if (response && response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response && Array.isArray(response)) {
        // Por si la respuesta viene en formato diferente
        setUsers(response);
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "RolID" ? parseInt(value) : value,
    });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      // Validacion de correo
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(formData.Email)) {
      setValidationError("Por favor, ingresa un correo electrónico válido (ejemplo@dominio.com).");
      return;
    }
    try {
      // Preparar datos según el formato del API
      const userData = {
        PrimerNombre: formData.PrimerNombre,
        SegundoNombre: formData.SegundoNombre,
        PrimerApellido: formData.PrimerApellido,
        SegundoApellido: formData.SegundoApellido,
        Email: formData.Email,
        RolID: formData.RolID,
        Contrasena: formData.Contrasena,
      };

      await callApi(
        () => authService.createUser(userData),
        "Usuario creado exitosamente"
      );

      // Limpiar formulario
      setFormData({
        PrimerNombre: "",
        SegundoNombre: "",
        PrimerApellido: "",
        SegundoApellido: "",
        Email: "",
        Contrasena: "",
        RolID: 2, // Reset a Profesor
      });

      // Recargar lista de usuarios
      await loadUsers();
    } catch (err) {
      console.error("Error creando usuario:", err);
    }
  };

  const handleResetPassword = async (userEmail) => {
    if (!window.confirm(`¿Reiniciar contraseña de ${userEmail}?`)) return;

    try {
      await callApi(
        () => authService.resetPassword({ Email: userEmail }),
        "Solicitud de reinicio enviada"
      );
    } catch (err) {
      console.error("Error reiniciando contraseña:", err);
    }
  };

  const getRoleBadge = (rolId) => {
    const role = roles.find((r) => r.id === rolId);
    const roleName = role ? role.nombre : "Desconocido";

    const roleClasses = {
      1: "badge-admin",
      2: "badge-docente",
      3: "badge-estudiante",
      4: "badge-dev",
      5: "badge-coordinador",
    };

    return (
      <span className={`role-badge ${roleClasses[rolId] || ""}`}>
        {roleName}
      </span>
    );
  };

  const getRoleName = (rolId) => {
    const role = roles.find((r) => r.id === rolId);
    return role ? role.nombre : "Desconocido";
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
                <label>Primer Nombre *</label>
                <input
                  type="text"
                  name="PrimerNombre"
                  value={formData.PrimerNombre}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Segundo Nombre</label>
                <input
                  type="text"
                  name="SegundoNombre"
                  value={formData.SegundoNombre}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Primer Apellido *</label>
                <input
                  type="text"
                  name="PrimerApellido"
                  value={formData.PrimerApellido}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Segundo Apellido</label>
                <input
                  type="text"
                  name="SegundoApellido"
                  value={formData.SegundoApellido}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className={validationError ? "invalid-input" : ""}
                />
                {validationError && (
                  <small className="validation-error">{validationError}</small>
                )}
              </div>
              <div className="form-group">
                <label>Contraseña Temporal *</label>
                <input
                  type="password"
                  name="Contrasena"
                  value={formData.Contrasena}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rol *</label>
              <select
                name="RolID"
                value={formData.RolID}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))}
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
                    <th>Nombre Completo</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.usuarioId || userItem.id}>
                      <td>
                        {userItem.nombre} {" "}
                        {userItem.apellido}{" "}
                      </td>
                      <td>{userItem.email}</td>
                      <td>{getRoleBadge(userItem.idRol)}</td>
                      <td>
                        <button
                          className="btn-reset"
                          onClick={() => handleResetPassword(userItem.email)}
                          disabled={loading}
                        >
                          Reiniciar Contraseña
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
