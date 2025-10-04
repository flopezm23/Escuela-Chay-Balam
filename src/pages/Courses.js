import React, { useState, useEffect } from "react";
import "./Courses.css";
import { useAuth } from "../context/AuthContext";
import { courseService } from "../services/courseService";
import { useApi } from "../hooks/useApi";

const Courses = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const canEdit = user?.role === "admin";

  // Cargar cursos al montar el componente
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await callApi(() => courseService.getCourses());
      if (response && Array.isArray(response)) {
        setCourses(response);
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
        () => courseService.createCourse(formData),
        "Curso creado exitosamente"
      );

      // Limpiar formulario
      setFormData({
        nombre: "",
        descripcion: "",
      });

      // Recargar la lista de cursos
      await loadCourses();
    } catch (err) {
      // El error ya está manejado por useApi
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este curso?")) {
      return;
    }

    try {
      await callApi(
        () => courseService.deleteCourse(courseId),
        "Curso eliminado exitosamente"
      );

      // Recargar la lista de cursos
      await loadCourses();
    } catch (err) {
      // El error ya está manejado por useApi
    }
  };

  return (
    <div className="courses-container">
      <h1>Gestión de Cursos</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Solo admin puede agregar cursos */}
      {canEdit && (
        <div className="courses-form">
          <h2>Registrar Nuevo Curso</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre del Curso:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Ej: Matemáticas Básicas"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows="3"
                placeholder="Descripción del curso..."
                disabled={loading}
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Registrar Curso"}
            </button>
          </form>
        </div>
      )}

      <div className="courses-list">
        <h2>Listado de Cursos ({courses.length})</h2>
        {loading && courses.length === 0 ? (
          <p className="loading-message">Cargando cursos...</p>
        ) : courses.length === 0 ? (
          <p className="no-data">No hay cursos registrados</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.cursoID} className="course-card">
                <h3>{course.nombre}</h3>
                <p>
                  <strong>ID:</strong> {course.cursoID}
                </p>
                <p>
                  <strong>Descripción:</strong> {course.descripcion}
                </p>
                {canEdit && (
                  <div className="course-actions">
                    <button
                      className="btn-edit"
                      onClick={() => {
                        /* Implementar edición */
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCourse(course.cursoID)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
