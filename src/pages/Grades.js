import React, { useState, useEffect } from "react";
import "./Grades.css";
import { useAuth } from "../context/AuthContext";
import { gradingService } from "../services/gradingService";
import { authService } from "../services/authService";
import { courseService } from "../services/courseService";
import { gradeSectionService } from "../services/gradeSectionService";
import { useApi } from "../hooks/useApi";

const Grades = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [gradesList, setGradesList] = useState([]);
  const [sections, setSections] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

  const [formData, setFormData] = useState({
    UsuarioId: "",
    TareaId: "",
    PunteoObtenido: "",
    Observacion: "",
  });

  const [filters, setFilters] = useState({
    UsuarioId: "",
    CursoId: "",
    GradoId: "",
    SeccionId: "",
  });

  const canEdit = user?.rolID === 2 || user?.rolID === 1 || user?.rolID === 5;
  const isStudent = user?.rolID === 3;
  const pageTitle = isStudent
    ? "Mis Calificaciones"
    : "Gestión de Calificaciones";

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
    if (isStudent) {
      loadStudentGrades();
    } else {
      // Cargar datos iniciales sin filtros
      loadFilteredData();
    }
  }, []);

  // Cuando cambien los filtros, cargar datos filtrados
  useEffect(() => {
    if (!isStudent) {
      loadFilteredData();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      // Cargar todos los estudiantes (solo rol 3 - Alumnos)
      const studentsResponse = await callApi(() =>
        authService.getUsers({ RolID: 3 })
      );
      if (studentsResponse) {
        const allStudents = studentsResponse.data || studentsResponse || [];
        setStudents(allStudents);
        setAvailableStudents(allStudents);
      }

      // Cargar todos los cursos
      const coursesResponse = await callApi(() => courseService.getCourses({}));
      if (coursesResponse) {
        const allCourses = coursesResponse.data || coursesResponse || [];
        setCourses(allCourses);
        setAvailableCourses(allCourses);
      }

      // Cargar todos los grados
      const gradesResponse = await callApi(() =>
        gradeSectionService.getGrades({})
      );
      if (gradesResponse) {
        const allGrades = gradesResponse.data || gradesResponse || [];
        setGradesList(allGrades);
        setAvailableGrades(allGrades);
      }

      // Cargar todas las secciones
      const sectionsResponse = await callApi(() =>
        gradeSectionService.getSections({})
      );
      if (sectionsResponse) {
        const allSections = sectionsResponse.data || sectionsResponse || [];
        setSections(allSections);
        setAvailableSections(allSections);
      }
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
    }
  };

  // Cargar datos filtrados basados en los filtros actuales
  const loadFilteredData = async () => {
    try {
      // Limpiar filtros vacíos antes de enviar
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== "" && value != null
        )
      );

      console.log("Cargando datos con filtros:", cleanFilters);

      const response = await callApi(() =>
        gradingService.filterGrades(cleanFilters)
      );

      if (response) {
        const filteredData = response.data || response || [];
        setGrades(filteredData);
        console.log("Datos filtrados cargados:", filteredData);

        // Actualizar las listas disponibles basadas en los datos filtrados
        updateAvailableOptions(filteredData);
      } else {
        setGrades([]);
        resetAvailableOptions();
      }
    } catch (err) {
      console.error("Error cargando datos filtrados:", err);
      setGrades([]);
      resetAvailableOptions();
    }
  };

  // Actualizar las opciones disponibles en los selects basado en los datos filtrados
  const updateAvailableOptions = (filteredData) => {
    if (!filteredData || filteredData.length === 0) {
      resetAvailableOptions();
      return;
    }

    // Extraer IDs únicos de los datos filtrados
    const uniqueStudentIds = [
      ...new Set(filteredData.map((item) => item.usuarioId || item.UsuarioId)),
    ].filter(Boolean);
    const uniqueCourseIds = [
      ...new Set(
        filteredData.map((item) => item.cursoId || item.cursoID || item.CursoId)
      ),
    ].filter(Boolean);
    const uniqueGradeIds = [
      ...new Set(
        filteredData.map((item) => item.gradoId || item.gradoID || item.GradoId)
      ),
    ].filter(Boolean);
    const uniqueSectionIds = [
      ...new Set(
        filteredData.map(
          (item) => item.seccionId || item.seccionID || item.SeccionId
        )
      ),
    ].filter(Boolean);

    // Filtrar las listas completas basadas en los IDs disponibles
    setAvailableStudents(
      students.filter((student) => uniqueStudentIds.includes(student.usuarioId))
    );
    setAvailableCourses(
      courses.filter((course) => uniqueCourseIds.includes(course.cursoID))
    );
    setAvailableGrades(
      gradesList.filter((grade) => uniqueGradeIds.includes(grade.gradoID))
    );
    setAvailableSections(
      sections.filter((section) => uniqueSectionIds.includes(section.seccionID))
    );
  };

  // Resetear las opciones disponibles a todas
  const resetAvailableOptions = () => {
    setAvailableStudents(students);
    setAvailableCourses(courses);
    setAvailableGrades(gradesList);
    setAvailableSections(sections);
  };

  const loadStudentGrades = async () => {
    try {
      const response = await callApi(() =>
        gradingService.filterGrades({ UsuarioId: user?.usuarioId })
      );
      if (response) {
        setGrades(response.data || response || []);
      }
    } catch (err) {
      console.error("Error cargando calificaciones del estudiante:", err);
      setGrades([]);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value || "",
    };
    setFilters(newFilters);

    // No necesitamos llamar loadFilteredData aquí porque el useEffect se encarga
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      const gradeData = {
        UsuarioId: parseInt(formData.UsuarioId),
        TareaId: parseInt(formData.TareaId),
        PunteoObtenido: parseFloat(formData.PunteoObtenido),
        Observacion: formData.Observacion || "",
      };

      await callApi(
        () => gradingService.gradeTask(gradeData),
        "Calificación registrada exitosamente"
      );

      // Limpiar formulario
      setFormData({
        UsuarioId: "",
        TareaId: "",
        PunteoObtenido: "",
        Observacion: "",
      });

      // Recargar datos filtrados
      await loadFilteredData();
    } catch (err) {
      console.error("Error registrando calificación:", err);
    }
  };

  // Función para calcular el estado (Aprobado/Reprobado)
  const getStatus = (calificacion) => {
    if (calificacion === null || calificacion === undefined) return "Pendiente";
    const nota = parseFloat(calificacion);
    return nota >= 61 ? "Aprobado" : "Reprobado";
  };

  // Función para obtener la clase CSS según el estado
  const getStatusClass = (calificacion) => {
    if (calificacion === null || calificacion === undefined) return "pendiente";
    const nota = parseFloat(calificacion);
    return nota >= 61 ? "aprobado" : "reprobado";
  };

  return (
    <div className="grades-container">
      <h1>{pageTitle}</h1>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Solo profesores/admin pueden calificar */}
      {canEdit && (
        <div className="grades-form">
          <h2>Registrar Calificación</h2>

          {/* Filtros para buscar tareas pendientes */}
          <div className="filters-section">
            <h3>Filtrar Tareas Pendientes</h3>
            <p className="filter-info">
              <strong>Nota:</strong> Al seleccionar cualquier filtro, se
              mostrarán solo las opciones relevantes.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Estudiante:</label>
                <select
                  name="UsuarioId"
                  value={filters.UsuarioId}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los estudiantes</option>
                  {availableStudents.map((student) => (
                    <option key={student.usuarioId} value={student.usuarioId}>
                      {student.primerNombre} {student.primerApellido}
                    </option>
                  ))}
                </select>
                <small>Disponibles: {availableStudents.length}</small>
              </div>
              <div className="form-group">
                <label>Curso:</label>
                <select
                  name="CursoId"
                  value={filters.CursoId}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los cursos</option>
                  {availableCourses.map((course) => (
                    <option key={course.cursoID} value={course.cursoID}>
                      {course.nombre}
                    </option>
                  ))}
                </select>
                <small>Disponibles: {availableCourses.length}</small>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Grado:</label>
                <select
                  name="GradoId"
                  value={filters.GradoId}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los grados</option>
                  {availableGrades.map((grade) => (
                    <option key={grade.gradoID} value={grade.gradoID}>
                      {grade.nombreGrado}
                    </option>
                  ))}
                </select>
                <small>Disponibles: {availableGrades.length}</small>
              </div>
              <div className="form-group">
                <label>Sección:</label>
                <select
                  name="SeccionId"
                  value={filters.SeccionId}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las secciones</option>
                  {availableSections.map((section) => (
                    <option key={section.seccionID} value={section.seccionID}>
                      {section.nombreSeccion}{" "}
                      {section.nombreGrado ? `- ${section.nombreGrado}` : ""}
                    </option>
                  ))}
                </select>
                <small>Disponibles: {availableSections.length}</small>
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFilters({
                  UsuarioId: "",
                  CursoId: "",
                  GradoId: "",
                  SeccionId: "",
                });
                resetAvailableOptions();
              }}
            >
              Limpiar Todos los Filtros
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Estudiante:</label>
                <select
                  name="UsuarioId"
                  value={formData.UsuarioId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {availableStudents.map((student) => (
                    <option key={student.usuarioId} value={student.usuarioId}>
                      {student.primerNombre} {student.primerApellido}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tarea:</label>
                <select
                  name="TareaId"
                  value={formData.TareaId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar tarea</option>
                  {grades
                    .filter((task) => !task.calificada && !task.punteoObtenido)
                    .map((task) => (
                      <option
                        key={task.tareaId || task.idTarea}
                        value={task.tareaId || task.idTarea}
                      >
                        {task.titulo || task.tituloTarea} -{" "}
                        {task.codigo || `ID: ${task.tareaId || task.idTarea}`}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Calificación (0-100):</label>
                <input
                  type="number"
                  name="PunteoObtenido"
                  value={formData.PunteoObtenido}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <input
                  type="text"
                  value={getStatus(formData.PunteoObtenido)}
                  readOnly
                  className={`status-input ${getStatusClass(
                    formData.PunteoObtenido
                  )}`}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observaciones:</label>
              <textarea
                name="Observacion"
                value={formData.Observacion}
                onChange={handleInputChange}
                rows="3"
                placeholder="Observaciones adicionales..."
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Calificación"}
            </button>
          </form>
        </div>
      )}

      <div className="grades-list">
        <h2>
          {isStudent
            ? "Mis Calificaciones"
            : "Tareas Pendientes de Calificación"}{" "}
          ({grades.length})
        </h2>
        {loading && grades.length === 0 ? (
          <p className="loading-message">Cargando...</p>
        ) : grades.length === 0 ? (
          <p className="no-data">
            {isStudent
              ? "No tienes calificaciones registradas"
              : "No hay tareas pendientes de calificación con los filtros actuales"}
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {!isStudent && <th>Estudiante</th>}
                  <th>Tarea</th>
                  <th>Curso</th>
                  <th>Fecha Entrega</th>
                  <th>Calificación</th>
                  <th>Estado</th>
                  {isStudent && <th>Observaciones</th>}
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, index) => (
                  <tr
                    key={
                      grade.tareaId ||
                      grade.idTarea ||
                      grade.calificacionId ||
                      index
                    }
                  >
                    {!isStudent && (
                      <td>
                        {grade.estudiante || grade.primerNombre}{" "}
                        {grade.primerApellido}
                      </td>
                    )}
                    <td>{grade.titulo || grade.tituloTarea}</td>
                    <td>{grade.nombreCurso || grade.curso}</td>
                    <td>
                      {grade.fechaEntrega
                        ? new Date(grade.fechaEntrega).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {grade.punteoObtenido || grade.punteoObtenido === 0
                        ? grade.punteoObtenido
                        : "Pendiente"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          grade.punteoObtenido
                        )}`}
                      >
                        {getStatus(grade.punteoObtenido)}
                      </span>
                    </td>
                    {isStudent && <td>{grade.observacion || "-"}</td>}
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

export default Grades;
