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

  // Siempre mostrar todas las opciones disponibles en los selects
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
      loadFilteredData();
    }
  }, []);

  // Cuando cambien los filtros, cargar datos filtrados (solo para la tabla)
  useEffect(() => {
    if (!isStudent) {
      loadFilteredData();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      console.log("Cargando datos iniciales...");

      // Cargar todos los estudiantes (solo rol 3 - Alumnos)
      const studentsResponse = await callApi(() =>
        authService.getUsers({ RolID: 3 })
      );
      console.log("Respuesta de estudiantes:", studentsResponse);

      if (studentsResponse) {
        let allStudents = [];

        // Manejar diferentes formatos de respuesta
        if (studentsResponse.success && Array.isArray(studentsResponse.data)) {
          allStudents = studentsResponse.data;
        } else if (Array.isArray(studentsResponse)) {
          allStudents = studentsResponse;
        } else if (
          studentsResponse.data &&
          Array.isArray(studentsResponse.data)
        ) {
          allStudents = studentsResponse.data;
        }

        console.log("Estudiantes procesados:", allStudents);
        setStudents(allStudents);
        setAvailableStudents(allStudents); // Siempre mostrar todos los estudiantes
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

  // Cargar datos filtrados basados en los filtros actuales (SOLO para la tabla)
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
        console.log("Datos filtrados recibidos:", filteredData);
        setGrades(filteredData);

        // IMPORTANTE: NO actualizar las listas disponibles basadas en los datos filtrados
        // porque el endpoint solo devuelve tareas sin calificar
      } else {
        setGrades([]);
      }
    } catch (err) {
      console.error("Error cargando datos filtrados:", err);
      setGrades([]);
    }
  };

  // ELIMINAR la función updateAvailableOptions completamente
  // ya que no queremos filtrar los selects basados en tareas pendientes

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

      // Recargar datos filtrados para actualizar la tabla
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

  // Función auxiliar para obtener nombre completo del estudiante
  const getStudentName = (student) => {
    if (!student) return "Nombre no disponible";

    // Diferentes formatos posibles de estudiantes
    if (student.primerNombre && student.primerApellido) {
      return `${student.primerNombre} ${student.primerApellido}`;
    } else if (student.nombre && student.apellido) {
      return `${student.nombre} ${student.apellido}`;
    } else if (student.estudiante) {
      return student.estudiante;
    } else if (student.email) {
      return student.email;
    } else {
      return `Estudiante ID: ${student.usuarioId || student.id}`;
    }
  };

  // Filtrar tareas pendientes para el select de tareas en el formulario de calificación
  const pendingTasks = grades.filter(
    (task) => !task.calificada && !task.punteoObtenido
  );

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
              <strong>Nota:</strong> Los filtros se aplican automáticamente a la
              tabla de abajo.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Estudiante:</label>
                <select
                  name="UsuarioId"
                  value={filters.UsuarioId}
                  onChange={handleFilterChange}
                >
                  <option value="">
                    Todos los estudiantes ({students.length})
                  </option>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <option
                        key={student.usuarioId || student.id}
                        value={student.usuarioId || student.id}
                      >
                        {getStudentName(student)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No hay estudiantes disponibles
                    </option>
                  )}
                </select>
                <small>
                  {filters.UsuarioId
                    ? "Estudiante seleccionado"
                    : `${students.length} estudiantes disponibles`}
                </small>
              </div>
              <div className="form-group">
                <label>Curso:</label>
                <select
                  name="CursoId"
                  value={filters.CursoId}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los cursos ({courses.length})</option>
                  {courses.map((course) => (
                    <option key={course.cursoID} value={course.cursoID}>
                      {course.nombre}
                    </option>
                  ))}
                </select>
                <small>
                  {filters.CursoId
                    ? "Curso seleccionado"
                    : `${courses.length} cursos disponibles`}
                </small>
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
                  <option value="">
                    Todos los grados ({gradesList.length})
                  </option>
                  {gradesList.map((grade) => (
                    <option key={grade.gradoID} value={grade.gradoID}>
                      {grade.nombreGrado}
                    </option>
                  ))}
                </select>
                <small>
                  {filters.GradoId
                    ? "Grado seleccionado"
                    : `${gradesList.length} grados disponibles`}
                </small>
              </div>
              <div className="form-group">
                <label>Sección:</label>
                <select
                  name="SeccionId"
                  value={filters.SeccionId}
                  onChange={handleFilterChange}
                >
                  <option value="">
                    Todas las secciones ({sections.length})
                  </option>
                  {sections.map((section) => (
                    <option key={section.seccionID} value={section.seccionID}>
                      {section.nombreSeccion}{" "}
                      {section.nombreGrado ? `- ${section.nombreGrado}` : ""}
                    </option>
                  ))}
                </select>
                <small>
                  {filters.SeccionId
                    ? "Sección seleccionada"
                    : `${sections.length} secciones disponibles`}
                </small>
              </div>
            </div>

            <div className="filter-actions">
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
                }}
              >
                Limpiar Todos los Filtros
              </button>
            </div>
          </div>

          {/* Formulario de calificación */}
          <div className="grading-form">
            <h3>Calificar Tarea</h3>
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
                    {students.length > 0 ? (
                      students.map((student) => (
                        <option
                          key={student.usuarioId || student.id}
                          value={student.usuarioId || student.id}
                        >
                          {getStudentName(student)}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No hay estudiantes disponibles
                      </option>
                    )}
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
                    {pendingTasks.length > 0 ? (
                      pendingTasks.map((task) => (
                        <option
                          key={task.tareaId || task.idTarea}
                          value={task.tareaId || task.idTarea}
                        >
                          {task.titulo || task.tituloTarea} -{" "}
                          {task.codigo || `ID: ${task.tareaId || task.idTarea}`}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No hay tareas pendientes con los filtros actuales
                      </option>
                    )}
                  </select>
                  <small>
                    {pendingTasks.length} tareas pendientes encontradas
                  </small>
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
        </div>
      )}

      {/* Lista de resultados */}
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
