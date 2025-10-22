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

  const [selectedStudentData, setSelectedStudentData] = useState(null);

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
    }
  }, []);

  // Cargar tareas pendientes cuando cambien los filtros
  useEffect(() => {
    if (!isStudent) {
      loadPendingTasks();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      // Cargar estudiantes (solo rol 3 - Alumnos)
      const studentsResponse = await callApi(() =>
        authService.getUsers({ RolID: 3 })
      );
      if (studentsResponse) {
        setStudents(studentsResponse.data || studentsResponse || []);
      }

      // Cargar cursos
      const coursesResponse = await callApi(() => courseService.getCourses({}));
      if (coursesResponse) {
        setCourses(coursesResponse.data || coursesResponse || []);
      }

      // Cargar grados
      const gradesResponse = await callApi(() =>
        gradeSectionService.getGrades({})
      );
      if (gradesResponse) {
        setGradesList(gradesResponse.data || gradesResponse || []);
      }

      // Cargar secciones inicialmente (todas)
      const sectionsResponse = await callApi(() =>
        gradeSectionService.getSections({})
      );
      if (sectionsResponse) {
        setSections(sectionsResponse.data || sectionsResponse || []);
      }
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
    }
  };

  // Cuando se selecciona un estudiante, cargar sus datos y llenar automáticamente los filtros
  const handleEstudianteChange = async (usuarioId) => {
    if (usuarioId) {
      try {
        console.log("Cargando datos del estudiante:", usuarioId);

        // Llamar al endpoint con el UsuarioId para obtener todos los datos del estudiante
        const studentDataResponse = await callApi(() =>
          gradingService.filterGrades({ UsuarioId: parseInt(usuarioId) })
        );

        console.log("Datos del estudiante:", studentDataResponse);

        if (studentDataResponse) {
          const studentData = studentDataResponse.data || studentDataResponse;
          setSelectedStudentData(studentData);

          // Si es un array, tomar el primer elemento (o procesar según la estructura)
          if (Array.isArray(studentData) && studentData.length > 0) {
            const firstRecord = studentData[0];

            // Actualizar automáticamente los filtros con los datos del estudiante
            setFilters((prev) => ({
              ...prev,
              UsuarioId: usuarioId,
              CursoId: firstRecord.cursoId || firstRecord.cursoID || "",
              GradoId: firstRecord.gradoId || firstRecord.gradoID || "",
              SeccionId: firstRecord.seccionId || firstRecord.seccionID || "",
            }));
          } else if (studentData && typeof studentData === "object") {
            // Si es un objeto individual
            setFilters((prev) => ({
              ...prev,
              UsuarioId: usuarioId,
              CursoId: studentData.cursoId || studentData.cursoID || "",
              GradoId: studentData.gradoId || studentData.gradoID || "",
              SeccionId: studentData.seccionId || studentData.seccionID || "",
            }));
          }
        }
      } catch (err) {
        console.error("Error cargando datos del estudiante:", err);
        setSelectedStudentData(null);
      }
    } else {
      // Si no hay estudiante seleccionado, limpiar los datos
      setSelectedStudentData(null);
      setFilters((prev) => ({
        ...prev,
        UsuarioId: "",
        CursoId: "",
        GradoId: "",
        SeccionId: "",
      }));
    }
  };

  // Cuando cambie el GradoId, cargar las secciones de ese grado
  const handleGradoChange = async (gradoId) => {
    if (gradoId) {
      try {
        const sectionsResponse = await callApi(() =>
          gradeSectionService.getSections({ GradoID: parseInt(gradoId) })
        );
        if (sectionsResponse) {
          setSections(sectionsResponse.data || sectionsResponse || []);
        }
      } catch (err) {
        console.error("Error cargando secciones del grado:", err);
        setSections([]);
      }
    } else {
      // Si no hay grado seleccionado, cargar todas las secciones
      const sectionsResponse = await callApi(() =>
        gradeSectionService.getSections({})
      );
      if (sectionsResponse) {
        setSections(sectionsResponse.data || sectionsResponse || []);
      }
    }
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

  const loadPendingTasks = async () => {
    try {
      // Limpiar filtros vacíos antes de enviar
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== "" && value != null
        )
      );

      console.log("Cargando tareas con filtros:", cleanFilters);

      const response = await callApi(() =>
        gradingService.filterGrades(cleanFilters)
      );

      if (response) {
        setGrades(response.data || response || []);
        console.log("Tareas cargadas:", response.data || response);
      } else {
        setGrades([]);
      }
    } catch (err) {
      console.error("Error cargando tareas pendientes:", err);
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

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value || "",
    };
    setFilters(newFilters);

    // Llamar endpoints específicos cuando cambien los selects
    switch (name) {
      case "UsuarioId":
        await handleEstudianteChange(value);
        break;
      case "GradoId":
        await handleGradoChange(value);
        break;
      default:
        break;
    }
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

      // Recargar tareas pendientes
      await loadPendingTasks();
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
            <div className="form-row">
              <div className="form-group">
                <label>Estudiante:</label>
                <select
                  name="UsuarioId"
                  value={filters.UsuarioId}
                  onChange={handleFilterChange}
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
                <label>Curso:</label>
                <select
                  name="CursoId"
                  value={filters.CursoId}
                  onChange={handleFilterChange}
                  disabled={!filters.UsuarioId} // Deshabilitar hasta que se seleccione estudiante
                >
                  <option value="">
                    {filters.UsuarioId
                      ? "Cargando..."
                      : "Seleccione estudiante primero"}
                  </option>
                  {filters.CursoId &&
                    courses.find((c) => c.cursoID == filters.CursoId) && (
                      <option value={filters.CursoId}>
                        {
                          courses.find((c) => c.cursoID == filters.CursoId)
                            ?.nombre
                        }
                      </option>
                    )}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Grado:</label>
                <select
                  name="GradoId"
                  value={filters.GradoId}
                  onChange={handleFilterChange}
                  disabled={!filters.UsuarioId}
                >
                  <option value="">
                    {filters.UsuarioId
                      ? "Cargando..."
                      : "Seleccione estudiante primero"}
                  </option>
                  {filters.GradoId &&
                    gradesList.find((g) => g.gradoID == filters.GradoId) && (
                      <option value={filters.GradoId}>
                        {
                          gradesList.find((g) => g.gradoID == filters.GradoId)
                            ?.nombreGrado
                        }
                      </option>
                    )}
                </select>
              </div>
              <div className="form-group">
                <label>Sección:</label>
                <select
                  name="SeccionId"
                  value={filters.SeccionId}
                  onChange={handleFilterChange}
                  disabled={!filters.UsuarioId}
                >
                  <option value="">
                    {filters.UsuarioId
                      ? "Cargando..."
                      : "Seleccione estudiante primero"}
                  </option>
                  {filters.SeccionId &&
                    sections.find((s) => s.seccionID == filters.SeccionId) && (
                      <option value={filters.SeccionId}>
                        {
                          sections.find((s) => s.seccionID == filters.SeccionId)
                            ?.nombreSeccion
                        }
                      </option>
                    )}
                </select>
              </div>
            </div>

            {/* Mostrar información del estudiante seleccionado */}
            {selectedStudentData && (
              <div className="student-info">
                <h4>Información del Estudiante Seleccionado:</h4>
                <div className="info-grid">
                  <div>
                    <strong>Estudiante:</strong>{" "}
                    {selectedStudentData.estudiante ||
                      students.find((s) => s.usuarioId == filters.UsuarioId)
                        ?.primerNombre +
                        " " +
                        students.find((s) => s.usuarioId == filters.UsuarioId)
                          ?.primerApellido}
                  </div>
                  <div>
                    <strong>Curso:</strong>{" "}
                    {selectedStudentData.curso ||
                      courses.find((c) => c.cursoID == filters.CursoId)?.nombre}
                  </div>
                  <div>
                    <strong>Grado:</strong>{" "}
                    {
                      gradesList.find((g) => g.gradoID == filters.GradoId)
                        ?.nombreGrado
                    }
                  </div>
                  <div>
                    <strong>Sección:</strong>{" "}
                    {selectedStudentData.seccion ||
                      sections.find((s) => s.seccionID == filters.SeccionId)
                        ?.nombreSeccion}
                  </div>
                </div>
              </div>
            )}

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
                setSelectedStudentData(null);
                // Resetear también las secciones a todas
                const sectionsResponse = callApi(() =>
                  gradeSectionService.getSections({})
                );
                if (sectionsResponse) {
                  setSections(sectionsResponse.data || sectionsResponse || []);
                }
              }}
            >
              Limpiar Filtros
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
