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
    PrimerNombre: "",
    SegundoNombre: "",
    PrimerApellido: "",
    SegundoApellido: "",
    Email: "",
    Contrasena: "",
    RolID: 3, // Por defecto: Estudiante
  });

  const canEdit = user?.rolID === 1 || user?.rolID === 5; // Admin o Coordinador

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      // Filtrar solo estudiantes (RolID: 3)
      const response = await callApi(() => authService.getUsers({ RolID: 3 }));

      // Manejar diferentes formatos de respuesta
      if (response && response.success && Array.isArray(response.data)) {
        setStudents(response.data);
      } else if (response && Array.isArray(response)) {
        setStudents(response);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
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
    if (!canEdit) return;

    try {
      await callApi(
        () => authService.createUser(formData),
        "Estudiante creado exitosamente"
      );

      // Limpiar formulario
      setFormData({
        PrimerNombre: "",
        SegundoNombre: "",
        PrimerApellido: "",
        SegundoApellido: "",
        Email: "",
        Contrasena: "",
        RolID: 3,
      });

      // Recargar la lista de estudiantes
      await loadStudents();
    } catch (err) {
      console.error("Error creando estudiante:", err);
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
        () => authService.resetPassword({ Email: studentEmail }),
        "Solicitud de reinicio de contraseña enviada"
      );
    } catch (err) {
      console.error("Error reiniciando contraseña:", err);
    }
  };

  return (
    <div className="students-container">
      <h1>Gestión de Estudiantes</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Solo admin/coordinador puede agregar estudiantes */}
      {canEdit && (
        <div className="students-form">
          <h2>Registrar Nuevo Estudiante</h2>
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
                  placeholder="Primer nombre"
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
                  placeholder="Segundo nombre"
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
                  placeholder="Primer apellido"
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
                  placeholder="Segundo apellido"
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
                  placeholder="correo@ejemplo.com"
                />
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
                  placeholder="Contraseña temporal"
                />
              </div>
            </div>

            <input
              type="hidden"
              name="RolID"
              value={3} // Siempre estudiante
            />

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
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  {canEdit && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.usuarioId}>
                    <td>
                      {student.primerNombre} {student.segundoNombre || ""}{" "}
                      {student.primerApellido} {student.segundoApellido || ""}
                    </td>
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
