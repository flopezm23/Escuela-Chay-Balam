import React, { useState, useEffect } from "react";
import "./Reports.css";
import { useAuth } from "../context/AuthContext";
import { reportService } from "../services/reportService";
import { gradeSectionService } from "../services/gradeSectionService";
import { courseService } from "../services/courseService";
import { useApi } from "../hooks/useApi";

const Reports = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("gradoSeccion");
  const [filters, setFilters] = useState({
    Grado: "",
    Seccion: "",
    Curso: "",
  });

  const canViewReports = user?.rolID === 1 || user?.rolID === 5; // Admin y Coordinador

  // Cargar datos iniciales
  useEffect(() => {
    if (canViewReports) {
      loadInitialData();
    }
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar grados
      const gradesResponse = await callApi(() =>
        gradeSectionService.getGrades({})
      );
      if (gradesResponse) {
        setGrades(gradesResponse.data || gradesResponse || []);
      }

      // Cargar secciones
      const sectionsResponse = await callApi(() =>
        gradeSectionService.getSections({})
      );
      if (sectionsResponse) {
        setSections(sectionsResponse.data || sectionsResponse || []);
      }

      // Cargar cursos
      const coursesResponse = await callApi(() => courseService.getCourses({}));
      if (coursesResponse) {
        setCourses(coursesResponse.data || coursesResponse || []);
      }
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setReportData(null);
    // Resetear filtros cuando cambie el tipo de reporte
    setFilters({
      Grado: "",
      Seccion: "",
      Curso: "",
    });
  };

  const generateReport = async () => {
    try {
      clearError();
      let response;

      switch (reportType) {
        case "gradoSeccion":
          if (!filters.Grado || !filters.Seccion) {
            alert("Por favor seleccione grado y sección");
            return;
          }
          response = await callApi(() =>
            reportService.getGradeSectionReport(filters)
          );
          break;

        case "gradoSeccionCurso":
          if (!filters.Grado || !filters.Seccion || !filters.Curso) {
            alert("Por favor seleccione grado, sección y curso");
            return;
          }
          response = await callApi(() =>
            reportService.getGradeSectionCourseReport(filters)
          );
          break;

        case "profesores":
          if (!filters.Grado || !filters.Seccion) {
            alert("Por favor seleccione grado y sección");
            return;
          }
          response = await callApi(() =>
            reportService.getTeacherAssignmentReport(filters)
          );
          break;

        default:
          return;
      }

      if (response) {
        setReportData(response.data || response);
      }
    } catch (err) {
      console.error("Error generando reporte:", err);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    // Encabezados basados en el tipo de reporte
    let headers = [];
    let rows = [];

    switch (reportType) {
      case "gradoSeccion":
        headers = ["Estudiante", "Curso", "Calificación Promedio", "Estado"];
        if (Array.isArray(reportData)) {
          rows = reportData.map((item) => [
            item.estudiante || item.nombreEstudiante,
            item.curso || item.nombreCurso,
            item.promedio || item.calificacionPromedio,
            item.estado || "N/A",
          ]);
        }
        break;

      case "gradoSeccionCurso":
        headers = ["Estudiante", "Tarea", "Calificación", "Fecha", "Estado"];
        if (Array.isArray(reportData)) {
          rows = reportData.map((item) => [
            item.estudiante || item.nombreEstudiante,
            item.tarea || item.tituloTarea,
            item.calificacion || item.punteoObtenido,
            item.fecha || item.fechaEntrega,
            item.estado || "N/A",
          ]);
        }
        break;

      case "profesores":
        headers = ["Profesor", "Curso", "Grado", "Sección", "Estudiantes"];
        if (Array.isArray(reportData)) {
          rows = reportData.map((item) => [
            item.profesor || item.nombreProfesor,
            item.curso || item.nombreCurso,
            item.grado || item.nombreGrado,
            item.seccion || item.nombreSeccion,
            item.cantidadEstudiantes || "N/A",
          ]);
        }
        break;
    }

    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `reporte_${reportType}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!canViewReports) {
    return (
      <div className="reports-container">
        <div className="unauthorized-message">
          <h1>Acceso No Autorizado</h1>
          <p>No tienes permisos para acceder a los reportes del sistema.</p>
          <p>
            Solo los administradores y coordinadores pueden ver los reportes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <h1>Reportes del Sistema</h1>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="reports-controls">
        <div className="report-type-selector">
          <h3>Tipo de Reporte</h3>
          <div className="report-options">
            <label>
              <input
                type="radio"
                name="reportType"
                value="gradoSeccion"
                checked={reportType === "gradoSeccion"}
                onChange={handleReportTypeChange}
              />
              Reporte por Grado y Sección
            </label>
            <label>
              <input
                type="radio"
                name="reportType"
                value="gradoSeccionCurso"
                checked={reportType === "gradoSeccionCurso"}
                onChange={handleReportTypeChange}
              />
              Reporte por Grado, Sección y Curso
            </label>
            <label>
              <input
                type="radio"
                name="reportType"
                value="profesores"
                checked={reportType === "profesores"}
                onChange={handleReportTypeChange}
              />
              Asignación de Profesores
            </label>
          </div>
        </div>

        <div className="report-filters">
          <h3>Filtros del Reporte</h3>
          <div className="filters-grid">
            <div className="form-group">
              <label>Grado:</label>
              <select
                name="Grado"
                value={filters.Grado}
                onChange={handleFilterChange}
              >
                <option value="">Seleccionar grado</option>
                {grades.map((grade) => (
                  <option key={grade.gradoID} value={grade.nombreGrado}>
                    {grade.nombreGrado}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sección:</label>
              <select
                name="Seccion"
                value={filters.Seccion}
                onChange={handleFilterChange}
              >
                <option value="">Seleccionar sección</option>
                {sections.map((section) => (
                  <option key={section.seccionID} value={section.nombreSeccion}>
                    {section.nombreSeccion}
                  </option>
                ))}
              </select>
            </div>

            {reportType === "gradoSeccionCurso" && (
              <div className="form-group">
                <label>Curso:</label>
                <select
                  name="Curso"
                  value={filters.Curso}
                  onChange={handleFilterChange}
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map((course) => (
                    <option key={course.cursoID} value={course.nombre}>
                      {course.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={generateReport}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="report-results">
          <div className="report-header">
            <h3>
              Reporte:{" "}
              {reportType === "gradoSeccion"
                ? "Por Grado y Sección"
                : reportType === "gradoSeccionCurso"
                ? "Por Grado, Sección y Curso"
                : "Asignación de Profesores"}
            </h3>
            <button onClick={exportToCSV} className="btn-secondary">
              📊 Exportar a CSV
            </button>
          </div>

          <div className="report-table">
            {Array.isArray(reportData) && reportData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    {reportType === "gradoSeccion" && (
                      <>
                        <th>Estudiante</th>
                        <th>Curso</th>
                        <th>Calificación Promedio</th>
                        <th>Estado</th>
                      </>
                    )}
                    {reportType === "gradoSeccionCurso" && (
                      <>
                        <th>Estudiante</th>
                        <th>Tarea</th>
                        <th>Calificación</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </>
                    )}
                    {reportType === "profesores" && (
                      <>
                        <th>Profesor</th>
                        <th>Curso</th>
                        <th>Grado</th>
                        <th>Sección</th>
                        <th>Estudiantes</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={index}>
                      {reportType === "gradoSeccion" && (
                        <>
                          <td>{item.estudiante || item.nombreEstudiante}</td>
                          <td>{item.curso || item.nombreCurso}</td>
                          <td>{item.promedio || item.calificacionPromedio}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                item.promedio >= 61 ||
                                item.calificacionPromedio >= 61
                                  ? "aprobado"
                                  : "reprobado"
                              }`}
                            >
                              {item.promedio >= 61 ||
                              item.calificacionPromedio >= 61
                                ? "Aprobado"
                                : "Reprobado"}
                            </span>
                          </td>
                        </>
                      )}
                      {reportType === "gradoSeccionCurso" && (
                        <>
                          <td>{item.estudiante || item.nombreEstudiante}</td>
                          <td>{item.tarea || item.tituloTarea}</td>
                          <td>{item.calificacion || item.punteoObtenido}</td>
                          <td>{item.fecha || item.fechaEntrega}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                item.calificacion >= 61 ||
                                item.punteoObtenido >= 61
                                  ? "aprobado"
                                  : "reprobado"
                              }`}
                            >
                              {item.calificacion >= 61 ||
                              item.punteoObtenido >= 61
                                ? "Aprobado"
                                : "Reprobado"}
                            </span>
                          </td>
                        </>
                      )}
                      {reportType === "profesores" && (
                        <>
                          <td>{item.profesor || item.nombreProfesor}</td>
                          <td>{item.curso || item.nombreCurso}</td>
                          <td>{item.grado || item.nombreGrado}</td>
                          <td>{item.seccion || item.nombreSeccion}</td>
                          <td>{item.cantidadEstudiantes || "N/A"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">
                No hay datos para mostrar con los filtros seleccionados.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
