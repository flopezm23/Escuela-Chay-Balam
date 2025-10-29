import React, { useState, useEffect } from "react";
import "./Grades.css";
import { useAuth } from "../context/AuthContext";
import { gradingService } from "../services/gradingService";
import { authService } from "../services/authService";
import { useApi } from "../hooks/useApi";

const Grades = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [gradesList, setGradesList] = useState([]);
  const [sections, setSections] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [filters, setFilters] = useState({
    UsuarioId: "",
    CursoId: "",
    GradoId: "",
    SeccionId: "",
  });

  const [formData, setFormData] = useState({
    UsuarioId: "",
    TareaId: "",
    PunteoObtenido: "",
    Observacion: "",
  });

  const [isLoadingFilterData, setIsLoadingFilterData] = useState(false);
  const [validationError, setValidationError] = useState("");

  const canEdit = user?.rolID === 2 || user?.rolID === 1 || user?.rolID === 5;
  const isStudent = user?.rolID === 3;
  const pageTitle = isStudent ? "Mis Calificaciones" : "Gestión de Calificaciones";

  // 🔹 Cargar solo estudiantes al iniciar
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const studentsResponse = await callApi(() => authService.getUsers({ RolID: 3 }));
      if (studentsResponse) {
        const allStudents = studentsResponse.data || studentsResponse || [];
        setStudents(allStudents);
      }
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
    }
  };

  // 🔹 Determinar estado visual (aprobado/reprobado)
  const getStatus = (score) => {
    if (score === "" || score === null) return "Pendiente";
    const n = parseFloat(score);
    return n >= 61 ? "Aprobado" : "Reprobado";
  };

  const getStatusClass = (score) => {
    if (score === "" || score === null) return "pendiente";
    const n = parseFloat(score);
    return n >= 61 ? "aprobado" : "reprobado";
  };

  // 🔹 Cuando se selecciona un estudiante
  const handleStudentChange = async (e) => {
    const userId = e.target.value;
    setFilters({
      UsuarioId: userId,
      CursoId: "",
      GradoId: "",
      SeccionId: "",
    });
    setFormData({ ...formData, UsuarioId: userId });
    setValidationError("");

    // Reiniciar selects dependientes
    setCourses([]);
    setGradesList([]);
    setSections([]);
    setTasks([]);

    if (!userId) return;

    try {
      setIsLoadingFilterData(true);
      const response = await callApi(() =>
        gradingService.filterGrades({ UsuarioId: parseInt(userId) })
      );

      const data = response.data || response || [];

      if (!data.length) {
        clearError();
        setCourses([]);
        setGradesList([]);
        setSections([]);
        setTasks([]);
        return;
      }

      const uniqueCourses = [
        ...new Map(data.map((item) => [item.cursoId, item.curso])).entries(),
      ].map(([id, nombre]) => ({ id, nombre }));

      const uniqueGrades = [
        ...new Map(data.map((item) => [item.gradoId, item.grado])).entries(),
      ].map(([id, nombre]) => ({ id, nombre }));

      const uniqueSections = [
        ...new Map(data.map((item) => [item.seccionId, item.seccion])).entries(),
      ].map(([id, nombre]) => ({ id, nombre }));

      const uniqueTasks = [
        ...new Map(data.map((item) => [item.idTarea, item.tituloTarea])).entries(),
      ].map(([id, nombre]) => ({ id, nombre }));

      setCourses(uniqueCourses);
      setGradesList(uniqueGrades);
      setSections(uniqueSections);
      setTasks(uniqueTasks);
    } catch (err) {
      if (err?.response?.status === 404) {
        clearError();
        setCourses([]);
        setGradesList([]);
        setSections([]);
        setTasks([]);
      } else {
        console.error("Error cargando datos del filtro:", err);
      }
    } finally {
      setIsLoadingFilterData(false);
    }
  };

  // 🔹 Manejar inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setValidationError("");
    clearError();
  };

  // 🔹 Enviar calificación con validaciones
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    // 🔸 Validaciones
    if (!formData.UsuarioId) {
      setValidationError("Debe seleccionar un estudiante.");
      return;
    }
    if (!formData.TareaId) {
      setValidationError("Debe seleccionar una tarea.");
      return;
    }
    if (!formData.PunteoObtenido || formData.PunteoObtenido === "") {
      setValidationError("Debe ingresar un punteo.");
      return;
    }
    if (!formData.Observacion || formData.Observacion.trim() === "") {
      setValidationError("Debe ingresar una observación.");
      return;
    }

    try {
      const gradeData = {
        UsuarioId: parseInt(formData.UsuarioId),
        TareaId: parseInt(formData.TareaId),
        PunteoObtenido: parseFloat(formData.PunteoObtenido),
        Observacion: formData.Observacion.trim(),
      };

      await callApi(
        () => gradingService.gradeTask(gradeData, "/api/Calificaciones/CalificarTarea"),
        "Calificación registrada exitosamente"
      );

      // ✅ Recargar toda la página después de registrar
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error("Error registrando calificación:", err);
    }
  };

  return (
    <div className="grades-container">
      <h1>{pageTitle}</h1>

      {/* Mostrar errores */}
      {validationError && (
        <div className="error-message">
          <strong>Error:</strong> {validationError}
        </div>
      )}

      {error && error !== "Request failed with status code 404" && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {canEdit && (
        <div className="grades-form">
          <h2>Registrar Calificación</h2>

          {/* 🔸 Select de estudiante */}
          <div className="filters-section">
            <div className="form-group">
              <label>Estudiante:</label>
              <select
                name="UsuarioId"
                value={filters.UsuarioId}
                onChange={handleStudentChange}
              >
                <option value="">Seleccionar estudiante...</option>
                {students.map((s) => (
                  <option key={s.usuarioId || s.id} value={s.usuarioId || s.id}>
                    {s.nombre} {s.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🔸 Selects dependientes */}
          <div className="form-row">
            <div className="form-group">
              <label>Curso:</label>
              <select
                name="CursoId"
                value={filters.CursoId}
                disabled={!courses.length}
                onChange={(e) =>
                  setFilters({ ...filters, CursoId: e.target.value })
                }
              >
                <option value="">
                  {isLoadingFilterData ? "Cargando cursos..." : "Seleccionar curso..."}
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Grado:</label>
              <select
                name="GradoId"
                value={filters.GradoId}
                disabled={!gradesList.length}
                onChange={(e) =>
                  setFilters({ ...filters, GradoId: e.target.value })
                }
              >
                <option value="">
                  {isLoadingFilterData ? "Cargando grados..." : "Seleccionar grado..."}
                </option>
                {gradesList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sección:</label>
              <select
                name="SeccionId"
                value={filters.SeccionId}
                disabled={!sections.length}
                onChange={(e) =>
                  setFilters({ ...filters, SeccionId: e.target.value })
                }
              >
                <option value="">
                  {isLoadingFilterData ? "Cargando secciones..." : "Seleccionar sección..."}
                </option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🔸 Select de tareas */}
          <div className="tasks-container" style={{ textAlign: "center", marginTop: "2rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Tareas pendientes:</label>
            <select
              name="TareaId"
              value={formData.TareaId}
              disabled={!tasks.length}
              onChange={handleInputChange}
              style={{ width: "50%", padding: "0.5rem" }}
            >
              <option value="">
                {isLoadingFilterData ? "Cargando tareas..." : "Seleccionar tarea..."}
              </option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>

            {/* Barra verde o roja */}
            <div
              className={`status-bar ${getStatusClass(formData.PunteoObtenido)}`}
              style={{
                width: "50%",
                height: "6px",
                margin: "8px auto",
                borderRadius: "4px",
              }}
            ></div>
          </div>

          {/* 🔸 Bloque de calificación */}
          <div className="grading-form" style={{ marginTop: "1rem" }}>
            <form onSubmit={handleSubmit}>
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
                    className={`status-input ${getStatusClass(formData.PunteoObtenido)}`}
                  />
                </div>
              </div>

              {/* 🔸 Observaciones debajo */}
              <div className="form-group" style={{ marginTop: "1rem" }}>
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
    </div>
  );
};

export default Grades;
