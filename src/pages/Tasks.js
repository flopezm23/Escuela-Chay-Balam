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
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [formData, setFormData] = useState({
    CursoID: "",
    GradoID: "",
    SeccionID: "",
    Titulo: "",
    Descripcion: "",
    FechaEntrega: "",
    PunteoTarea: "",
  });

  const canEdit = user?.rolID === 2 || user?.rolID === 1 || user?.rolID === 5;
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
      console.log("🔄 Cargando tareas...");
      const response = await callApi(() => taskService.getTasks({}));
      console.log("📦 Respuesta completa de tareas:", response);

      // Manejar diferentes formatos de respuesta - ADAPTADO PARA TU INTERCEPTOR
      if (response && response.success && Array.isArray(response.data)) {
        console.log("✅ Tareas cargadas (formato 1):", response.data);
        setTasks(response.data);
      } else if (response && Array.isArray(response)) {
        console.log(
          "✅ Tareas cargadas (formato 2 - array directo):",
          response
        );
        setTasks(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log("✅ Tareas cargadas (formato 3):", response.data);
        setTasks(response.data);
      } else if (response && Array.isArray(response.tareas)) {
        console.log(
          "✅ Tareas cargadas (formato 4 - con propiedad tareas):",
          response.tareas
        );
        setTasks(response.tareas);
      } else {
        console.log("❌ Formato inesperado de tareas:", response);
        setTasks([]);
      }
    } catch (err) {
      console.error("❌ Error cargando tareas:", err);
      setTasks([]);
    }
  };
  // Nueva funcion para filtrar secciones por grado
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
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "GradoID" && value) {
      await handleGradoChange(value);
    }

    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      if (isEditing) {
        // Actualizar tarea existente
        const updateData = {
          TareaID: editingTaskId,
          Titulo: formData.Titulo,
          Descripcion: formData.Descripcion,
          FechaEntrega: formData.FechaEntrega
            ? new Date(formData.FechaEntrega).toISOString()
            : undefined,
          // Solo incluir estos campos si fueron modificados
          ...(formData.CursoID && { CursoID: parseInt(formData.CursoID) }),
          ...(formData.GradoID && { GradoID: parseInt(formData.GradoID) }),
          ...(formData.SeccionID && {
            SeccionID: parseInt(formData.SeccionID),
          }),
          ...(formData.PunteoTarea && {
            PunteoTarea: parseFloat(formData.PunteoTarea),
          }),
        };

        console.log("🔄 Actualizando tarea:", updateData);

        await callApi(
          () => taskService.updateTask(updateData),
          "Tarea actualizada exitosamente"
        );
      } else {
        // Crear nueva tarea
        const taskData = {
          CursoID: parseInt(formData.CursoID),
          GradoID: parseInt(formData.GradoID),
          SeccionID: parseInt(formData.SeccionID),
          Titulo: formData.Titulo,
          Descripcion: formData.Descripcion,
          FechaEntrega: new Date(formData.FechaEntrega).toISOString(),
          PunteoTarea: parseFloat(formData.PunteoTarea) || 0,
        };

        console.log("📝 Creando nueva tarea:", taskData);

        await callApi(
          () => taskService.createTask(taskData),
          "Tarea creada exitosamente"
        );
      }

      // Limpiar formulario y estado
      resetForm();

      // Recargar la lista de tareas
      await loadTasks();
    } catch (err) {
      console.error("❌ Error en operación de tarea:", err);
    }
  };

  const handleEdit = (task) => {
    console.log("✏️ Editando tarea:", task);
    setIsEditing(true);
    setEditingTaskId(task.tareaID);

    // Formatear fecha para el input datetime-local
    const fechaEntrega = task.fechaEntrega
      ? new Date(task.fechaEntrega).toISOString().slice(0, 16)
      : "";

    setFormData({
      CursoID: task.cursoID?.toString() || task.cursoId?.toString() || "",
      GradoID: task.gradoID?.toString() || task.gradoId?.toString() || "",
      SeccionID: task.seccionID?.toString() || task.seccionId?.toString() || "",
      Titulo: task.titulo || "",
      Descripcion: task.descripcion || "",
      FechaEntrega: fechaEntrega,
      PunteoTarea: task.punteoTarea?.toString() || "",
    });

    // Cargar secciones del grado seleccionado
    if (task.gradoID || task.gradoId) {
      handleGradoChange(task.gradoID || task.gradoId);
    }

    // Scroll al formulario
    document
      .querySelector(".tasks-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (taskId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Eliminando tarea ID:", taskId);
      await callApi(
        () => taskService.deleteTask({ TareaID: taskId }),
        "Tarea eliminada exitosamente"
      );

      // Recargar la lista de tareas
      await loadTasks();
    } catch (err) {
      console.error("❌ Error eliminando tarea:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      CursoID: "",
      GradoID: "",
      SeccionID: "",
      Titulo: "",
      Descripcion: "",
      FechaEntrega: "",
      PunteoTarea: "",
    });
    setIsEditing(false);
    setEditingTaskId(null);

    // Recargar todas las secciones
    loadInitialData();
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

      {/* Solo docentes pueden crear/editar tareas */}
      {canEdit && (
        <div className="tasks-form">
          <h2>{isEditing ? "Editar Tarea" : "Crear Nueva Tarea"}</h2>
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

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar Tarea"
                  : "Crear Tarea"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
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
              <div key={task.tareaID || task.id} className="task-card">
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
                    <strong>Código:</strong> {task.idTareaCreada || "N/A"}
                  </p>
                  <p>
                    <strong>Curso:</strong> {task.nombreCurso || "N/A"}
                  </p>
                  <p>
                    <strong>Fecha de entrega:</strong>{" "}
                    {formatDate(task.fechaEntrega)}
                  </p>
                  <p>
                    <strong>Grado/Sección:</strong> {task.nombregrado || "N/A"}{" "}
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
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(task)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(task.tareaID || task.id)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
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
