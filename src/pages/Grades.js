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

  const canEdit = user?.rolID === 2 || user?.rolID === 1 || user?.rolID === 5; // Profesor, Admin o Coordinador
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
      loadPendingTasks();
    }
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar estudiantes (solo rol 3 - Alumnos)
      const studentsResponse = await callApi(() =>
        authService.getUsers({ RolID: 3 })
      );
      if (studentsResponse && studentsResponse.success) {
        setStudents(studentsResponse.data || []);
      }

      // Cargar cursos
      const coursesResponse = await callApi(() => courseService.getCourses());
      if (coursesResponse && coursesResponse.success) {
        setCourses(coursesResponse.data || []);
      }

      // Cargar grados
      const gradesResponse = await callApi(() =>
        gradeSectionService.getGrades()
      );
      if (gradesResponse && gradesResponse.success) {
        setGradesList(gradesResponse.data || []);
      }

      // Cargar secciones
      const sectionsResponse = await callApi(() =>
        gradeSectionService.getSections()
      );
      if (sectionsResponse && sectionsResponse.success) {
        setSections(sectionsResponse.data || []);
      }
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
    }
  };

  const loadStudentGrades = async () => {
    try {
      const response = await callApi(() =>
        gradingService.filterGrades({ UsuarioId: user?.usuarioId })
      );
      if (response && response.success) {
        setGrades(response.data || []);
      }
    } catch (err) {
      console.error("Error cargando calificaciones:", err);
    }
  };

  const loadPendingTasks = async () => {
    try {
      const response = await callApi(() =>
        gradingService.filterGrades(filters)
      );
      if (response && response.success) {
        setGrades(response.data || []);
      }
    } catch (err) {
      console.error("Error cargando tareas pendientes:", err);
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
      [name]: value,
    };
    setFilters(newFilters);

    // Recargar tareas pendientes cuando cambian los filtros
    if (!isStudent) {
      loadPendingTasksWithFilters(newFilters);
    }
  };

  const loadPendingTasksWithFilters = async (filterData) => {
    try {
      const response = await callApi(() =>
        gradingService.filterGrades(filterData)
      );
      if (response && response.success) {
        setGrades(response.data || []);
      }
    } catch (err) {
      console.error("Error cargando tareas:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      await callApi(
        () => gradingService.gradeTask(formData),
        "Calificación registrada exitosamente"
      );

      // Limpiar formulario
      setFormData({
        UsuarioId: "",
        TareaId: "",
        PunteoObtenido: "",
        Observacion: "",
      });

      // Recargar tareas pendientes
      await loadPendingTasks();
    } catch (err) {
      console.error("Error registrando calificación:", err);
    }
  };

  // Función para calcular el estado (Aprobado/Reprobado)
  const getStatus = (calificacion) => {
    const nota = parseInt(calificacion);
    return nota >= 61 ? "Aprobado" : "Reprobado";
  };

  // Función para obtener la clase CSS según el estado
  const getStatusClass = (calificacion) => {
    const nota = parseInt(calificacion);
    return nota >= 61 ? "aprobado" : "reprobado";
  };

  return (
    <div className="grades-container">
      <h1>{pageTitle}</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Solo profesores/admin pueden calificar */}
      {canEdit && (
        <div className="grades-form">
          <h2>Registrar Calificación</h2>

          {/* Filtros para buscar tareas pendientes */}
          <div className="filters-section">
            <h3>Filtrar Tareas Pendientes</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Estudiante:</label>
                <select
                  name="UsuarioId"
                  value={filters.UsuarioId}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los estudiantes</option>
                  {students.map((student) => (
                    <option key={student.usuarioId} value={student.usuarioId}>
                      {student.primerNombre} {student.primerApellido}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Curso:</label>
                <select
                  name="CursoId"
                  value={filters.CursoId}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los cursos</option>
                  {courses.map((course) => (
                    <option key={course.cursoID} value={course.cursoID}>
                      {course.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                  {students.map((student) => (
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
                    .filter((task) => !task.calificada) // Solo tareas no calificadas
                    .map((task) => (
                      <option key={task.tareaId} value={task.tareaId}>
                        {task.titulo} - {task.codigo}
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
                  required
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <input
                  type="text"
                  value={
                    formData.PunteoObtenido
                      ? getStatus(formData.PunteoObtenido)
                      : ""
                  }
                  readOnly
                  className={`status-input ${
                    formData.PunteoObtenido
                      ? getStatusClass(formData.PunteoObtenido)
                      : ""
                  }`}
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
              : "No hay tareas pendientes de calificación"}
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
                {grades.map((grade) => (
                  <tr key={grade.tareaId || grade.calificacionId}>
                    {!isStudent && (
                      <td>
                        {grade.primerNombre} {grade.primerApellido}
                      </td>
                    )}
                    <td>{grade.titulo}</td>
                    <td>{grade.nombreCurso}</td>
                    <td>{new Date(grade.fechaEntrega).toLocaleDateString()}</td>
                    <td>
                      {grade.punteoObtenido || grade.punteoObtenido === 0
                        ? grade.punteoObtenido
                        : "Pendiente"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          grade.punteoObtenido || grade.punteoObtenido === 0
                            ? getStatusClass(grade.punteoObtenido)
                            : "pendiente"
                        }`}
                      >
                        {grade.punteoObtenido || grade.punteoObtenido === 0
                          ? getStatus(grade.punteoObtenido)
                          : "Pendiente"}
                      </span>
                    </td>
                    {isStudent && <td>{grade.observacion}</td>}
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
