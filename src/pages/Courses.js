import React, { useState, useEffect } from "react";
import "./Courses.css";
import { useAuth } from "../context/AuthContext";
import { courseService } from "../services/courseService";
import { useApi } from "../hooks/useApi";

const Courses = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // Para el datalist
  const [formData, setFormData] = useState({
    CursoID: "",
    Nombre: "",
    Descripcion: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const canEdit = user?.rolID === 1 || user?.rolID === 5;

  // Cargar cursos al montar el componente
  useEffect(() => {
    loadCourses();
    loadAllCoursesForDatalist();
  }, []);

  const loadCourses = async (searchQuery = "") => {
    try {
      const filters = searchQuery ? { Q: searchQuery } : {};
      const response = await callApi(() => courseService.getCourses(filters));

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

  // Cargar todos los cursos para el datalist (sin filtros)
  const loadAllCoursesForDatalist = async () => {
    try {
      const response = await courseService.getCourses();
      let coursesList = [];

      if (response && response.success && Array.isArray(response.data)) {
        coursesList = response.data;
      } else if (response && Array.isArray(response)) {
        coursesList = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        coursesList = response.data;
      }

      // Ordenar alfabéticamente por nombre
      coursesList.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setAllCourses(coursesList);
    } catch (err) {
      console.error("Error cargando cursos para datalist:", err);
      setAllCourses([]);
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

  const handleSearchSelect = (e) => {
    const selectedValue = e.target.value;
    setSearchTerm(selectedValue);
    // Si el usuario selecciona una opción del datalist, buscar inmediatamente
    if (selectedValue) {
      loadCourses(selectedValue);
    }
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
        await callApi(
          () => courseService.updateCourse(formData),
          "Curso actualizado exitosamente"
        );
      } else {
        await callApi(
          () => courseService.createCourse(formData),
          "Curso creado exitosamente"
        );
      }

      resetForm();
      await loadCourses(searchTerm);
      await loadAllCoursesForDatalist(); // Actualizar datalist después de cambios
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

      await loadCourses(searchTerm);
      await loadAllCoursesForDatalist(); // Actualizar datalist después de eliminar
    } catch (err) {
      console.error("Error eliminando curso:", err);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  // Obtener opciones únicas y ordenadas para el datalist
  const getDatalistOptions = () => {
    const uniqueNames = [...new Set(allCourses.map((course) => course.nombre))];
    return uniqueNames.sort((a, b) => a.localeCompare(b));
  };

  return (
    <div className="courses-container">
      <h1>Gestión de Cursos</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Búsqueda con datalist */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-group">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onInput={handleSearchSelect}
                list="courses-datalist"
                placeholder="Buscar cursos por nombre... 🔍"
                disabled={loading}
                className="search-input-with-datalist"
              />
              <datalist id="courses-datalist">
                {getDatalistOptions().map((courseName, index) => (
                  <option key={index} value={courseName}>
                    {courseName}
                  </option>
                ))}
              </datalist>
              <div className="datalist-hint">
                ⬇️ Escribe y selecciona de la lista
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-search">
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
                className="btn-clear-search"
              >
                ✕ Limpiar
              </button>
            )}
          </div>
        </form>

        {/* Información de búsqueda */}
        {searchTerm && (
          <div className="search-info">
            <small>
              Mostrando {courses.length} curso{courses.length !== 1 ? "s" : ""}
              {searchTerm && ` para "${searchTerm}"`}
            </small>
          </div>
        )}
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
                  list="new-course-datalist"
                />
                <datalist id="new-course-datalist">
                  {getDatalistOptions().map((courseName, index) => (
                    <option key={index} value={courseName}>
                      {courseName}
                    </option>
                  ))}
                </datalist>
                <div className="input-hint">
                  💡 Puedes escribir y seleccionar de cursos existentes
                </div>
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
          <div className="list-actions">
            <button
              onClick={() => loadCourses(searchTerm)}
              className="btn-refresh"
              disabled={loading}
            >
              🔄 Actualizar
            </button>
            <button
              onClick={loadAllCoursesForDatalist}
              className="btn-refresh-datalist"
              disabled={loading}
              title="Actualizar lista de búsqueda"
            >
              📝 Actualizar Lista
            </button>
          </div>
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
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  loadCourses();
                }}
                className="btn-clear-search-inline"
              >
                Ver todos los cursos
              </button>
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
