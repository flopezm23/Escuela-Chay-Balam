import React, { useState } from "react";
import "./Reports.css";
import { useAuth } from "../context/AuthContext";
import { reportService } from "../services/reportService";
import { useApi } from "../hooks/useApi";

const Reports = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("gradoSeccion");

  const canViewReports = user?.rolID === 1 || user?.rolID === 5; // Admin y Coordinador

  const generateReport = async (type) => {
    try {
      clearError();
      setReportType(type);
      let response;

      switch (type) {
        case "gradoSeccion":
          response = await callApi(() =>
            reportService.getGradeSectionReport({})
          );
          break;

        case "gradoSeccionCurso":
          response = await callApi(() =>
            reportService.getGradeSectionCourseReport({})
          );
          break;

        case "profesores":
          response = await callApi(() =>
            reportService.getTeacherAssignmentReport({})
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

    let headers = [];
    let rows = [];

    switch (reportType) {
      case "gradoSeccion":
        headers = ["Estudiante", "Curso", "Calificación Promedio", "Estado"];
        if (Array.isArray(reportData)) {
          rows = reportData.map((item) => [
            item.estudiante || item.nombreEstudiante || "N/A",
            item.curso || item.nombreCurso || "N/A",
            item.promedio || item.calificacionPromedio || "N/A",
            item.estado || "N/A",
          ]);
        }
        break;

      case "gradoSeccionCurso":
        headers = ["Estudiante", "Tarea", "Calificación", "Fecha", "Estado"];
        if (Array.isArray(reportData)) {
          rows = reportData.map((item) => [
            item.estudiante || item.nombreEstudiante || "N/A",
            item.tarea || item.tituloTarea || "N/A",
            item.calificacion || item.punteoObtenido || "N/A",
            item.fecha || item.fechaEntrega || "N/A",
            item.estado || "N/A",
          ]);
        }
        break;

      case "profesores":
        headers = ["Profesor", "Curso", "Grado", "Sección", "Estudiantes"];
        if (Array.isArray(reportData)) {
          rows = reportData.map((item) => [
            item.profesor || item.nombreProfesor || "N/A",
            item.curso || item.nombreCurso || "N/A",
            item.grado || item.nombreGrado || "N/A",
            item.seccion || item.nombreSeccion || "N/A",
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
          <h3>Seleccione el Tipo de Reporte</h3>
          <div className="report-buttons">
            <button
              onClick={() => generateReport("gradoSeccion")}
              className={`report-btn ${
                reportType === "gradoSeccion" ? "active" : ""
              }`}
              disabled={loading}
            >
              📊 Reporte por Grado y Sección
            </button>
            <button
              onClick={() => generateReport("gradoSeccionCurso")}
              className={`report-btn ${
                reportType === "gradoSeccionCurso" ? "active" : ""
              }`}
              disabled={loading}
            >
              📚 Reporte por Grado, Sección y Curso
            </button>
            <button
              onClick={() => generateReport("profesores")}
              className={`report-btn ${
                reportType === "profesores" ? "active" : ""
              }`}
              disabled={loading}
            >
              👨‍🏫 Asignación de Profesores
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-indicator">
            <p>Generando reporte...</p>
          </div>
        )}
      </div>

      {reportData && (
        <div className="report-results">
          <div className="report-header">
            <h3>
              {reportType === "gradoSeccion" &&
                "📊 Reporte por Grado y Sección"}
              {reportType === "gradoSeccionCurso" &&
                "📚 Reporte por Grado, Sección y Curso"}
              {reportType === "profesores" && "👨‍🏫 Asignación de Profesores"}
              <span className="record-count">
                {" "}
                ({Array.isArray(reportData) ? reportData.length : 1} registros)
              </span>
            </h3>
            <button onClick={exportToCSV} className="btn-export">
              📥 Exportar a CSV
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
                          <td>
                            {item.estudiante || item.nombreEstudiante || "N/A"}
                          </td>
                          <td>{item.curso || item.nombreCurso || "N/A"}</td>
                          <td>
                            {item.promedio ||
                              item.calificacionPromedio ||
                              "N/A"}
                          </td>
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
                          <td>
                            {item.estudiante || item.nombreEstudiante || "N/A"}
                          </td>
                          <td>{item.tarea || item.tituloTarea || "N/A"}</td>
                          <td>
                            {item.calificacion || item.punteoObtenido || "N/A"}
                          </td>
                          <td>{item.fecha || item.fechaEntrega || "N/A"}</td>
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
                          <td>
                            {item.profesor || item.nombreProfesor || "N/A"}
                          </td>
                          <td>{item.curso || item.nombreCurso || "N/A"}</td>
                          <td>{item.grado || item.nombreGrado || "N/A"}</td>
                          <td>{item.seccion || item.nombreSeccion || "N/A"}</td>
                          <td>{item.cantidadEstudiantes || "N/A"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">
                No hay datos disponibles para este reporte.
              </p>
            )}
          </div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="welcome-message">
          <h3>👋 Bienvenido a los Reportes</h3>
          <p>
            Selecciona uno de los reportes disponibles para generar la
            información del sistema.
          </p>
          <div className="report-types-info">
            <div className="info-card">
              <h4>📊 Grado y Sección</h4>
              <p>Calificaciones promedio de estudiantes por grado y sección</p>
            </div>
            <div className="info-card">
              <h4>📚 Grado, Sección y Curso</h4>
              <p>Detalle de tareas y calificaciones específicas por curso</p>
            </div>
            <div className="info-card">
              <h4>👨‍🏫 Asignación de Profesores</h4>
              <p>Distribución de profesores por grado, sección y curso</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
