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
  const [filters, setFilters] = useState({
    grado: "",
    seccion: "",
    curso: "",
  });

  const canViewReports = user?.rolID === 1 || user?.rolID === 5;

  // Función para generar reporte con filtros
  const generateReport = async (type) => {
    try {
      clearError();
      setReportType(type);
      let response;

      console.log(`Generando reporte ${type} con filtros:`, filters);

      switch (type) {
        case "gradoSeccion":
          response = await callApi(() =>
            reportService.getGradeSectionReport(filters.grado, filters.seccion)
          );
          break;

        case "gradoSeccionCurso":
          response = await callApi(() =>
            reportService.getGradeSectionCourseReport(
              filters.grado,
              filters.seccion,
              filters.curso
            )
          );
          break;

        case "profesores":
          response = await callApi(() =>
            reportService.getTeacherAssignmentReport(
              filters.grado,
              filters.seccion
            )
          );
          break;

        default:
          return;
      }

      console.log("Respuesta completa del reporte:", response);
      console.log("Tipo de respuesta:", typeof response);
      console.log("Es array?", Array.isArray(response));

      // La respuesta ES el array directamente
      if (response && Array.isArray(response)) {
        setReportData(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Por si acaso alguna vez viene en response.data
        setReportData(response.data);
      } else {
        console.log("No se encontraron datos en el formato esperado");
        setReportData([]);
      }
    } catch (err) {
      console.error("Error generando reporte:", err);
      setReportData(null);
    }
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Función exportToCSV
  const exportToCSV = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = [];
    let rows = [];

    switch (reportType) {
      case "gradoSeccion":
        headers = ["ID", "Estudiante", "Grado", "Sección", "Rol"];
        rows = reportData.map((item) => [
          item.usuarioId || "N/A",
          `${item.nombreAlumno || "N/A"} ${item.apellidoAlumno || ""}`.trim(),
          item.nombreGrado || "N/A",
          item.nombreSeccion || "N/A",
          item.nombreRol || "N/A",
        ]);
        break;

      case "gradoSeccionCurso":
        headers = ["ID", "Estudiante", "Grado", "Sección", "Curso", "Rol"];
        rows = reportData.map((item) => [
          item.usuarioId || "N/A",
          `${item.nombreAlumno || "N/A"} ${item.apellidoAlumno || ""}`.trim(),
          item.nombreGrado || "N/A",
          item.nombreSeccion || "N/A",
          item.nombreCurso || "N/A",
          item.nombreRol || "N/A",
        ]);
        break;

      case "profesores":
        headers = ["Profesor", "Grado", "Sección", "Curso"];
        rows = reportData.map((item) => [
          `${item.nombreProfesor || item.nombreAlumno || "N/A"} ${
            item.apellidoProfesor || item.apellidoAlumno || ""
          }`.trim(),
          item.nombreGrado || "N/A",
          item.nombreSeccion || "N/A",
          item.nombreCurso || "N/A",
        ]);
        break;

      default:
        headers = ["Datos"];
        rows = reportData.map((item) => [JSON.stringify(item)]);
    }

    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
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

  // Renderizar tabla basada en los datos reales de la respuesta
  const renderTable = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      return (
        <p className="no-data">No hay datos disponibles para este reporte.</p>
      );
    }

    // Debug: mostrar estructura del primer item
    console.log("Primer item de reportData:", reportData[0]);

    switch (reportType) {
      case "gradoSeccion":
        return (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Grado</th>
                <th>Sección</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.usuarioId || "N/A"}</td>
                  <td>
                    {`${item.nombreAlumno || "N/A"} ${
                      item.apellidoAlumno || ""
                    }`.trim()}
                  </td>
                  <td>{item.nombreGrado || "N/A"}</td>
                  <td>{item.nombreSeccion || "N/A"}</td>
                  <td>{item.nombreRol || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "gradoSeccionCurso":
        return (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Grado</th>
                <th>Sección</th>
                <th>Curso</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.usuarioId || "N/A"}</td>
                  <td>
                    {`${item.nombreAlumno || "N/A"} ${
                      item.apellidoAlumno || ""
                    }`.trim()}
                  </td>
                  <td>{item.nombreGrado || "N/A"}</td>
                  <td>{item.nombreSeccion || "N/A"}</td>
                  <td>{item.nombreCurso || "N/A"}</td>
                  <td>{item.nombreRol || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "profesores":
        return (
          <table>
            <thead>
              <tr>
                <th>Profesor</th>
                <th>Grado</th>
                <th>Sección</th>
                <th>Curso</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>
                    {`${item.nombreProfesor || item.nombreAlumno || "N/A"} ${
                      item.apellidoProfesor || item.apellidoAlumno || ""
                    }`.trim()}
                  </td>
                  <td>{item.nombreGrado || "N/A"}</td>
                  <td>{item.nombreSeccion || "N/A"}</td>
                  <td>{item.nombreCurso || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return (
          <table>
            <thead>
              <tr>
                <th>Datos (Formato no reconocido)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{JSON.stringify(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  // Componente de filtros
  const renderFilters = () => (
    <div className="report-filters">
      <h4>Filtros</h4>
      <div className="filter-controls">
        <div className="filter-group">
          <label>Grado:</label>
          <input
            type="text"
            value={filters.grado}
            onChange={(e) => handleFilterChange("grado", e.target.value)}
            placeholder="Ej: Primero, Segundo"
          />
        </div>
        <div className="filter-group">
          <label>Sección:</label>
          <input
            type="text"
            value={filters.seccion}
            onChange={(e) => handleFilterChange("seccion", e.target.value)}
            placeholder="Ej: A, B, C"
          />
        </div>
        {reportType === "gradoSeccionCurso" && (
          <div className="filter-group">
            <label>Curso:</label>
            <input
              type="text"
              value={filters.curso}
              onChange={(e) => handleFilterChange("curso", e.target.value)}
              placeholder="Ej: Lengua, Matemáticas"
            />
          </div>
        )}
        <button
          onClick={() => generateReport(reportType)}
          className="btn-generate"
          disabled={loading}
        >
          {loading ? "Generando..." : "Generar Reporte"}
        </button>
      </div>
    </div>
  );

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
              onClick={() => {
                setReportType("gradoSeccion");
                setReportData(null);
                setFilters({ grado: "", seccion: "", curso: "" });
              }}
              className={`report-btn ${
                reportType === "gradoSeccion" ? "active" : ""
              }`}
            >
              📊 Reporte por Grado y Sección
            </button>
            <button
              onClick={() => {
                setReportType("gradoSeccionCurso");
                setReportData(null);
                setFilters({ grado: "", seccion: "", curso: "" });
              }}
              className={`report-btn ${
                reportType === "gradoSeccionCurso" ? "active" : ""
              }`}
            >
              📚 Reporte por Grado, Sección y Curso
            </button>
            <button
              onClick={() => {
                setReportType("profesores");
                setReportData(null);
                setFilters({ grado: "", seccion: "", curso: "" });
              }}
              className={`report-btn ${
                reportType === "profesores" ? "active" : ""
              }`}
            >
              👨‍🏫 Asignación de Profesores
            </button>
          </div>
        </div>

        {renderFilters()}

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
                ({Array.isArray(reportData) ? reportData.length : 1} registros)
              </span>
            </h3>
            <button onClick={exportToCSV} className="btn-export">
              📥 Exportar a CSV
            </button>
          </div>

          <div className="report-table">{renderTable()}</div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="welcome-message">
          <h3>👋 Bienvenido a los Reportes</h3>
          <p>
            Selecciona un tipo de reporte, ingresa los filtros necesarios y haz
            clic en "Generar Reporte".
          </p>
          <div className="report-types-info">
            <div className="info-card">
              <h4>📊 Grado y Sección</h4>
              <p>Lista de estudiantes por grado y sección</p>
            </div>
            <div className="info-card">
              <h4>📚 Grado, Sección y Curso</h4>
              <p>Estudiantes filtrados por grado, sección y curso específico</p>
            </div>
            <div className="info-card">
              <h4>👨‍🏫 Asignación de Profesores</h4>
              <p>Distribución de profesores por cursos y secciones</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
