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
    titulo: "",
    descripcion: "",
    cursoID: "",
    gradoID: "",
    seccionID: "",
    fechaEntrega: "",
  });

  const canEdit = user?.role === "docente" || user?.role === "admin";
  const pageTitle =
    user?.role === "estudiante" ? "Mis Tareas" : "Gestión de Tareas";

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
    loadTasks();
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar cursos
      const coursesResponse = await callApi(() => courseService.getCourses());
      if (coursesResponse && Array.isArray(coursesResponse)) {
        setCourses(coursesResponse);
      }

      // Cargar grados
      const gradesResponse = await callApi(() =>
        gradeSectionService.getGrades()
      );
      if (gradesResponse && Array.isArray(gradesResponse)) {
        setGrades(gradesResponse);
      }

      // Cargar secciones
      const sectionsResponse = await callApi(() =>
        gradeSectionService.getSections()
      );
      if (sectionsResponse && Array.isArray(sectionsResponse)) {
        setSections(sectionsResponse);
      }
    } catch (err) {
      // El error ya está manejado por useApi
    }
  };

  const loadTasks = async () => {
    try {
      const response = await callApi(() => taskService.getTasks());
      if (response && Array.isArray(response)) {
        setTasks(response);
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
      // Convertir fecha a formato ISO
      const taskData = {
        ...formData,
        cursoID: parseInt(formData.cursoID),
        gradoID: parseInt(formData.gradoID),
        seccionID: parseInt(formData.seccionID),
        fechaEntrega: new Date(formData.fechaEntrega).toISOString(),
      };

      const response = await callApi(
        () => taskService.createTask(taskData),
        "Tarea creada exitosamente"
      );

      // Limpiar formulario
      setFormData({
        titulo: "",
        descripcion: "",
        cursoID: "",
        gradoID: "",
        seccionID: "",
        fechaEntrega: "",
      });

      // Recargar la lista de tareas
      await loadTasks();
    } catch (err) {
      // El error ya está manejado por useApi
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="tasks-container">
      <h1>{pageTitle}</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Solo docentes pueden crear tareas */}
      {canEdit && (
        <div className="tasks-form">
          <h2>Crear Nueva Tarea</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Título de la Tarea:</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Ej: Tarea de Matemáticas - Capítulo 1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Curso:</label>
                <select
                  name="cursoID"
                  value={formData.cursoID}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map((course) => (
                    <option key={course.cursoID} value={course.cursoID}>
                      {course.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Grado:</label>
                <select
                  name="gradoID"
                  value={formData.gradoID}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar grado</option>
                  {grades.map((grade) => (
                    <option key={grade.gradoID} value={grade.gradoID}>
                      {grade.nombreGrado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sección:</label>
                <select
                  name="seccionID"
                  value={formData.seccionID}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar sección</option>
                  {sections.map((section) => (
                    <option key={section.seccionID} value={section.seccionID}>
                      {section.nombreGrado} - {section.nombreSeccion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Entrega:</label>
                <input
                  type="datetime-local"
                  name="fechaEntrega"
                  value={formData.fechaEntrega}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción de la Tarea:</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
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
          {user?.role === "estudiante" ? "Mis Tareas" : "Tareas Asignadas"} (
          {tasks.length})
        </h2>
        {loading && tasks.length === 0 ? (
          <p className="loading-message">Cargando tareas...</p>
        ) : tasks.length === 0 ? (
          <p className="no-data">
            {user?.role === "estudiante"
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
                    <strong>Código:</strong> {task.codigo}
                  </p>
                  <p>
                    <strong>Curso:</strong> {task.nombreCurso}
                  </p>
                  <p>
                    <strong>Fecha de entrega:</strong>{" "}
                    {formatDate(task.fechaEntrega)}
                  </p>
                  <p>
                    <strong>Grado/Sección:</strong> {task.nombreGrado} -{" "}
                    {task.nombreSeccion}
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
                {user?.role === "estudiante" && (
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
