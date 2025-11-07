import React, { useState, useEffect } from "react";
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

  // Estados para las opciones de los dropdowns
  const [dropdownOptions, setDropdownOptions] = useState({
    grados: [],
    secciones: [],
    cursos: [],
  });

  const [availableOptions, setAvailableOptions] = useState({
    grados: [],
    secciones: [],
    cursos: [],
  });

  const canViewReports = user?.rolID === 1 || user?.rolID === 5;

  // Funciones para obtener opciones (integradas directamente)
  const getDefaultGrados = () => [
    "Primero",
    "Segundo",
    "Tercero",
    "Cuarto",
    "Quinto",
    "Sexto",
  ];
  const getDefaultSecciones = () => ["A", "B", "C", "D"];
  const getDefaultCursos = () => [
    "Lengua",
    "Matemáticas",
    "Ciencias",
    "Historia",
    "Inglés",
  ];

  // Cargar opciones iniciales al montar el componente
  useEffect(() => {
    loadInitialOptions();
  }, []);

  // Cargar opciones disponibles basadas en los datos del reporte
  useEffect(() => {
    if (reportData && Array.isArray(reportData)) {
      extractAvailableOptions();
    }
  }, [reportData]);

  const loadInitialOptions = async () => {
    try {
      // Usar valores por defecto
      const grados = getDefaultGrados();
      const secciones = getDefaultSecciones();
      const cursos = getDefaultCursos();

      setDropdownOptions({
        grados: [...new Set(grados)].sort(),
        secciones: [...new Set(secciones)].sort(),
        cursos: [...new Set(cursos)].sort(),
      });

      setAvailableOptions({
        grados: [...new Set(grados)].sort(),
        secciones: [...new Set(secciones)].sort(),
        cursos: [...new Set(cursos)].sort(),
      });
    } catch (error) {
      console.error("Error cargando opciones iniciales:", error);
    }
  };

  const extractAvailableOptions = () => {
    if (!reportData || !Array.isArray(reportData)) return;

    const grados = [
      ...new Set(reportData.map((item) => item.nombreGrado).filter(Boolean)),
    ].sort();
    const secciones = [
      ...new Set(reportData.map((item) => item.nombreSeccion).filter(Boolean)),
    ].sort();
    const cursos = [
      ...new Set(reportData.map((item) => item.nombreCurso).filter(Boolean)),
    ].sort();

    setAvailableOptions({
      grados: grados.length > 0 ? grados : dropdownOptions.grados,
      secciones: secciones.length > 0 ? secciones : dropdownOptions.secciones,
      cursos: cursos.length > 0 ? cursos : dropdownOptions.cursos,
    });
  };

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

      // La respuesta ES el array directamente
      if (response && Array.isArray(response)) {
        setReportData(response);
      } else if (response && response.data && Array.isArray(response.data)) {
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

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      grado: "",
      seccion: "",
      curso: "",
    });
    setReportData(null);
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

  // Renderizar tabla
  const renderTable = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      return (
        <p className="no-data">No hay datos disponibles para este reporte.</p>
      );
    }

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

  // Componente de filtros con dropdowns
  const renderFilters = () => (
    <div className="report-filters">
      <h4>Filtros</h4>
      <div className="filter-controls">
        <div className="filter-group">
          <label>Grado:</label>
          <select
            value={filters.grado}
            onChange={(e) => handleFilterChange("grado", e.target.value)}
          >
            <option value="">Todos los grados</option>
            {availableOptions.grados.map((grado) => (
              <option key={grado} value={grado}>
                {grado}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sección:</label>
          <select
            value={filters.seccion}
            onChange={(e) => handleFilterChange("seccion", e.target.value)}
          >
            <option value="">Todas las secciones</option>
            {availableOptions.secciones.map((seccion) => (
              <option key={seccion} value={seccion}>
                {seccion}
              </option>
            ))}
          </select>
        </div>

        {reportType === "gradoSeccionCurso" && (
          <div className="filter-group">
            <label>Curso:</label>
            <select
              value={filters.curso}
              onChange={(e) => handleFilterChange("curso", e.target.value)}
            >
              <option value="">Todos los cursos</option>
              {availableOptions.cursos.map((curso) => (
                <option key={curso} value={curso}>
                  {curso}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-actions">
          <button
            onClick={() => generateReport(reportType)}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </button>

          <button
            onClick={clearFilters}
            className="btn-clear"
            disabled={loading}
          >
            Limpiar Filtros
          </button>
        </div>
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
                clearFilters();
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
                clearFilters();
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
                clearFilters();
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
            Selecciona un tipo de reporte, elige los filtros necesarios y haz
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
