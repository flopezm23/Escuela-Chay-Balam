import React, { useState, useEffect } from "react";
import "./Students.css";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useApi } from "../hooks/useApi";

const Students = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    contrasenia: "",
    rol: "Estudiante",
  });

  const canEdit = user?.role === "admin";

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await callApi(() => authService.getUsers());
      if (response && Array.isArray(response)) {
        // Filtrar solo estudiantes o mostrar todos según necesidad
        setStudents(response);
      }
    } catch (err) {
      // El error ya está manejado por useApi
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
    if (!canEdit) return;

    try {
      const response = await callApi(
        () => authService.createUser(formData),
        "Usuario creado exitosamente"
      );

      // Limpiar formulario
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        contrasenia: "",
        rol: "Estudiante",
      });

      // Recargar la lista de estudiantes
      await loadStudents();
    } catch (err) {
      // El error ya está manejado por useApi
    }
  };

  const handleResetPassword = async (studentEmail) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres reiniciar la contraseña de ${studentEmail}?`
      )
    ) {
      return;
    }

    try {
      await callApi(
        () => authService.resetPassword(studentEmail),
        "Solicitud de reinicio de contraseña enviada"
      );
    } catch (err) {
      // El error ya está manejado por useApi
    }
  };

  return (
    <div className="students-container">
      <h1>Gestión de Estudiantes</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Solo admin puede agregar estudiantes */}
      {canEdit && (
        <div className="students-form">
          <h2>Registrar Nuevo Estudiante</h2>
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
                  placeholder="Nombre del estudiante"
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
                  placeholder="Apellido del estudiante"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Correo Electrónico:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="correo@ejemplo.com"
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
                  placeholder="Contraseña temporal"
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
                <option value="Estudiante">Estudiante</option>
                <option value="Docente">Docente</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Registrar Estudiante"}
            </button>
          </form>
        </div>
      )}

      <div className="students-list">
        <h2>Listado de Estudiantes ({students.length})</h2>
        {loading && students.length === 0 ? (
          <p className="loading-message">Cargando estudiantes...</p>
        ) : students.length === 0 ? (
          <p className="no-data">No hay estudiantes registrados</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  {canEdit && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.nombre}</td>
                    <td>{student.apellido}</td>
                    <td>{student.email}</td>
                    {canEdit && (
                      <td>
                        <button
                          className="btn-reset"
                          onClick={() => handleResetPassword(student.email)}
                          disabled={loading}
                        >
                          Reiniciar Pass
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
