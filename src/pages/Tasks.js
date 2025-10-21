import React, { useState, useEffect } from "react";
import "./Tasks.css";
import { useAuth } from "../context/AuthContext";
import { taskService } from "../services/taskService";
import { courseService } from "../services/courseService";
import { gradeSectionService } from "../services/gradeSectionService";
import { useApi } from "../hooks/useApi";

const Tasks = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    CursoID: "",
    GradoID: "",
    SeccionID: "",
    Titulo: "",
    Descripcion: "",
    FechaEntrega: "",
    PunteoTarea: "",
  });

  const canEdit = user?.rolID === 2 || user?.rolID === 1 || user?.rolID === 5; // Profesor, Admin o Coordinador
  const isStudent = user?.rolID === 3;
  const pageTitle = isStudent ? "Mis Tareas" : "Gestión de Tareas";

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
    loadTasks();
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar cursos
      const coursesResponse = await callApi(() => courseService.getCourses({}));
      if (
        coursesResponse &&
        coursesResponse.success &&
        Array.isArray(coursesResponse.data)
      ) {
        setCourses(coursesResponse.data);
      } else if (coursesResponse && Array.isArray(coursesResponse)) {
        setCourses(coursesResponse);
      } else {
        console.log("Formato inesperado de cursos:", coursesResponse);
        setCourses([]);
      }

      // Cargar grados
      const gradesResponse = await callApi(() =>
        gradeSectionService.getGrades({})
      );
      if (
        gradesResponse &&
        gradesResponse.success &&
        Array.isArray(gradesResponse.data)
      ) {
        setGrades(gradesResponse.data);
      } else if (gradesResponse && Array.isArray(gradesResponse)) {
        setGrades(gradesResponse);
      } else {
        console.log("Formato inesperado de grados:", gradesResponse);
        setGrades([]);
      }

      // Cargar secciones
      const sectionsResponse = await callApi(() =>
        gradeSectionService.getSections({})
      );
      if (
        sectionsResponse &&
        sectionsResponse.success &&
        Array.isArray(sectionsResponse.data)
      ) {
        setSections(sectionsResponse.data);
      } else if (sectionsResponse && Array.isArray(sectionsResponse)) {
        setSections(sectionsResponse);
      } else {
        console.log("Formato inesperado de secciones:", sectionsResponse);
        setSections([]);
      }
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await callApi(() => taskService.getTasks({}));
      // Manejar diferentes formatos de respuesta
      if (response && response.success && Array.isArray(response.data)) {
        setTasks(response.data);
      } else if (response && Array.isArray(response)) {
        setTasks(response);
      } else {
        console.log("Formato inesperado de tareas:", response);
        setTasks([]);
      }
    } catch (err) {
      console.error("Error cargando tareas:", err);
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
      // Preparar datos según el formato exacto que espera el API
      const taskData = {
        CursoID: parseInt(formData.CursoID),
        GradoID: parseInt(formData.GradoID),
        SeccionID: parseInt(formData.SeccionID),
        Titulo: formData.Titulo,
        Descripcion: formData.Descripcion,
        FechaEntrega: new Date(formData.FechaEntrega).toISOString(),
        PunteoTarea: parseFloat(formData.PunteoTarea) || 0,
      };

      console.log("Enviando datos de tarea:", taskData);

      await callApi(
        () => taskService.createTask(taskData),
        "Tarea creada exitosamente"
      );

      // Limpiar formulario
      setFormData({
        CursoID: "",
        GradoID: "",
        SeccionID: "",
        Titulo: "",
        Descripcion: "",
        FechaEntrega: "",
        PunteoTarea: "",
      });

      // Recargar la lista de tareas
      await loadTasks();
    } catch (err) {
      console.error("Error creando tarea:", err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("es-GT", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  return (
    <div className="tasks-container">
      <h1>{pageTitle}</h1>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Solo docentes pueden crear tareas */}
      {canEdit && (
        <div className="tasks-form">
          <h2>Crear Nueva Tarea</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Título de la Tarea *</label>
                <input
                  type="text"
                  name="Titulo"
                  value={formData.Titulo}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Ej: Tarea de Matemáticas - Capítulo 1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Curso *</label>
                <select
                  name="CursoID"
                  value={formData.CursoID}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map((course) => (
                    <option key={course.cursoID} value={course.cursoID}>
                      {course.nombre} (ID: {course.cursoID})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Grado *</label>
                <select
                  name="GradoID"
                  value={formData.GradoID}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar grado</option>
                  {grades.map((grade) => (
                    <option key={grade.gradoID} value={grade.gradoID}>
                      {grade.nombreGrado} (ID: {grade.gradoID})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sección *</label>
                <select
                  name="SeccionID"
                  value={formData.SeccionID}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar sección</option>
                  {sections.map((section) => (
                    <option key={section.seccionID} value={section.seccionID}>
                      {section.nombreSeccion} (ID: {section.seccionID})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Entrega *</label>
                <input
                  type="datetime-local"
                  name="FechaEntrega"
                  value={formData.FechaEntrega}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Punteo de la Tarea *</label>
                <input
                  type="number"
                  name="PunteoTarea"
                  value={formData.PunteoTarea}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  disabled={loading}
                  placeholder="Ej: 10.0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción de la Tarea *</label>
              <textarea
                name="Descripcion"
                value={formData.Descripcion}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe los detalles de la tarea..."
                required
                disabled={loading}
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear Tarea"}
            </button>
          </form>
        </div>
      )}

      <div className="tasks-list">
        <h2>
          {isStudent ? "Mis Tareas" : "Tareas Asignadas"} ({tasks.length})
        </h2>
        {loading && tasks.length === 0 ? (
          <p className="loading-message">Cargando tareas...</p>
        ) : tasks.length === 0 ? (
          <p className="no-data">
            {isStudent
              ? "No tienes tareas asignadas"
              : "No hay tareas asignadas"}
          </p>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div key={task.tareaID} className="task-card">
                <div className="task-header">
                  <h3>{task.titulo}</h3>
                  <span
                    className={`task-status ${
                      task.estado?.toLowerCase() || "pendiente"
                    }`}
                  >
                    {task.estado || "Pendiente"}
                  </span>
                </div>
                <div className="task-details">
                  <p>
                    <strong>Código:</strong> {task.codigo || "N/A"}
                  </p>
                  <p>
                    <strong>Curso:</strong> {task.nombreCurso || "N/A"}
                  </p>
                  <p>
                    <strong>Fecha de entrega:</strong>{" "}
                    {formatDate(task.fechaEntrega)}
                  </p>
                  <p>
                    <strong>Grado/Sección:</strong> {task.nombreGrado || "N/A"}{" "}
                    - {task.nombreSeccion || "N/A"}
                  </p>
                  <p>
                    <strong>Punteo:</strong> {task.punteoTarea || "0"} puntos
                  </p>
                </div>
                <div className="task-description">
                  <p>{task.descripcion}</p>
                </div>
                {canEdit && (
                  <div className="task-actions">
                    <button className="btn-edit">Editar</button>
                    <button className="btn-delete">Eliminar</button>
                  </div>
                )}
                {isStudent && (
                  <div className="task-actions">
                    <button className="btn-primary">Entregar Tarea</button>
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

export default Tasks;
