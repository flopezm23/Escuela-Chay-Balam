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
    CursoID: "",
    Nombre: "",
    Descripcion: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const canEdit = user?.rolID === 1 || user?.rolID === 5; // Admin o Coordinador

  // Cargar cursos al montar el componente
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async (searchQuery = "") => {
    try {
      const filters = searchQuery ? { Q: searchQuery } : {};
      const response = await callApi(() => courseService.getCourses(filters));

      // Manejar diferentes formatos de respuesta
      if (response && response.success && Array.isArray(response.data)) {
        setCourses(response.data);
      } else if (response && Array.isArray(response)) {
        setCourses(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Error cargando cursos:", err);
      setCourses([]);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCourses(searchTerm);
  };

  const resetForm = () => {
    setFormData({
      CursoID: "",
      Nombre: "",
      Descripcion: "",
    });
    setIsEditing(false);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      if (isEditing) {
        // Actualizar curso existente
        await callApi(
          () => courseService.updateCourse(formData),
          "Curso actualizado exitosamente"
        );
      } else {
        // Crear nuevo curso
        await callApi(
          () => courseService.createCourse(formData),
          "Curso creado exitosamente"
        );
      }

      // Limpiar formulario y recargar lista
      resetForm();
      await loadCourses(searchTerm);
    } catch (err) {
      console.error("Error guardando curso:", err);
    }
  };

  const handleEditCourse = (course) => {
    setFormData({
      CursoID: course.cursoID.toString(),
      Nombre: course.nombre,
      Descripcion: course.descripcion,
    });
    setIsEditing(true);
    // Scroll to form
    document
      .querySelector(".courses-form")
      ?.scrollIntoView({ behavior: "smooth" });
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
      await loadCourses(searchTerm);
    } catch (err) {
      console.error("Error eliminando curso:", err);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  return (
    <div className="courses-container">
      <h1>Gestión de Cursos</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Búsqueda */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-group">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar cursos por nombre o descripción..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              🔍 Buscar
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  loadCourses();
                }}
                disabled={loading}
              >
                ✕ Limpiar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Solo admin/coordinador puede agregar/editar cursos */}
      {canEdit && (
        <div className="courses-form">
          <h2>{isEditing ? "Editar Curso" : "Registrar Nuevo Curso"}</h2>
          <form onSubmit={handleSubmit}>
            {isEditing && (
              <div className="form-group">
                <label>ID del Curso:</label>
                <input
                  type="text"
                  value={formData.CursoID}
                  disabled
                  className="disabled-input"
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Nombre del Curso:</label>
                <input
                  type="text"
                  name="Nombre"
                  value={formData.Nombre}
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
                name="Descripcion"
                value={formData.Descripcion}
                onChange={handleInputChange}
                rows="3"
                placeholder="Descripción del curso..."
                disabled={loading}
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar Curso"
                  : "Registrar Curso"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="courses-list">
        <div className="list-header">
          <h2>Listado de Cursos ({courses.length})</h2>
          <button
            onClick={() => loadCourses(searchTerm)}
            className="btn-refresh"
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>

        {loading && courses.length === 0 ? (
          <p className="loading-message">Cargando cursos...</p>
        ) : courses.length === 0 ? (
          <div className="no-data-message">
            <div className="no-data-icon">📚</div>
            <h3>No hay cursos registrados</h3>
            <p>
              {searchTerm
                ? `No se encontraron cursos que coincidan con "${searchTerm}"`
                : "No hay cursos disponibles en el sistema."}
            </p>
            {canEdit && !searchTerm && (
              <p className="no-data-suggestion">
                Usa el formulario arriba para registrar el primer curso.
              </p>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.cursoID} className="course-card">
                <div className="course-header">
                  <h3>{course.nombre}</h3>
                  <span className="course-id">ID: {course.cursoID}</span>
                </div>
                <p className="course-description">
                  {course.descripcion || "Sin descripción"}
                </p>
                {canEdit && (
                  <div className="course-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditCourse(course)}
                      disabled={loading}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCourse(course.cursoID)}
                      disabled={loading}
                    >
                      🗑️ Eliminar
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
