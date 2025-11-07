import React, { useState, useEffect } from "react";
import "./Reports.css";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

// Importar api directamente
import api from "../services/api";

const ENDPOINTS = {
  GRADE_SECTION_REPORT: "/Reportes/GradoSeccion",
  GRADE_SECTION_COURSE_REPORT: "/Reportes/GradoSeccionCurso",
  TEACHER_ASSIGNMENT_REPORT: "/Reportes/ProfeXGradoCursoSeccion",
};

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

  const [availableOptions, setAvailableOptions] = useState({
    grados: [],
    secciones: [],
    cursos: [],
  });

  const [defaultOptions, setDefaultOptions] = useState({
    grados: [],
    secciones: [],
    cursos: [],
  });

  const canViewReports = user?.rolID === 1 || user?.rolID === 5;

  // Función para ordenar grados de manera natural (Primero, Segundo, Tercero, etc.)
  const ordenarGrados = (grados) => {
    const orden = [
      "Primero",
      "Segundo",
      "Tercero",
      "Cuarto",
      "Quinto",
      "Sexto",
    ];
    return grados.sort((a, b) => {
      const indexA = orden.indexOf(a);
      const indexB = orden.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  // Funciones para obtener opciones por defecto
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

  useEffect(() => {
    loadInitialOptions();
  }, []);

  useEffect(() => {
    if (reportData && Array.isArray(reportData)) {
      extractAvailableOptions();
    }
  }, [reportData]);

  const loadInitialOptions = () => {
    const grados = ordenarGrados(getDefaultGrados());
    const secciones = getDefaultSecciones().sort();
    const cursos = getDefaultCursos().sort();

    const initialOptions = {
      grados,
      secciones,
      cursos,
    };

    setDefaultOptions(initialOptions);
    setAvailableOptions(initialOptions);
  };

  const extractAvailableOptions = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      // Si no hay datos, mantener las opciones por defecto
      setAvailableOptions(defaultOptions);
      return;
    }

    // Extraer opciones únicas de los datos
    const gradosData = [
      ...new Set(reportData.map((item) => item.nombreGrado).filter(Boolean)),
    ];
    const seccionesData = [
      ...new Set(reportData.map((item) => item.nombreSeccion).filter(Boolean)),
    ];
    const cursosData = [
      ...new Set(reportData.map((item) => item.nombreCurso).filter(Boolean)),
    ];

    // Combinar con opciones por defecto y ordenar
    const combinedGrados = ordenarGrados([
      ...new Set([...defaultOptions.grados, ...gradosData]),
    ]);
    const combinedSecciones = [
      ...new Set([...defaultOptions.secciones, ...seccionesData]),
    ].sort();
    const combinedCursos = [
      ...new Set([...defaultOptions.cursos, ...cursosData]),
    ].sort();

    setAvailableOptions({
      grados: combinedGrados,
      secciones: combinedSecciones,
      cursos: combinedCursos,
    });
  };

  // Función para generar reporte - con mejor manejo de errores
  const generateReport = async (type) => {
    try {
      clearError();
      setReportType(type);
      setReportData(null); // Limpiar datos anteriores

      let response;

      console.log(`Generando reporte ${type} con filtros:`, filters);

      // Validar que los filtros no contengan valores inválidos
      const filtrosLimpios = {
        Grado: filters.grado || "",
        Seccion: filters.seccion || "",
        Curso: filters.curso || "",
      };

      switch (type) {
        case "gradoSeccion":
          response = await callApi(() =>
            api.post(ENDPOINTS.GRADE_SECTION_REPORT, {
              Grado: filtrosLimpios.Grado,
              Seccion: filtrosLimpios.Seccion,
            })
          );
          break;

        case "gradoSeccionCurso":
          response = await callApi(() =>
            api.post(ENDPOINTS.GRADE_SECTION_COURSE_REPORT, {
              Grado: filtrosLimpios.Grado,
              Seccion: filtrosLimpios.Seccion,
              Curso: filtrosLimpios.Curso,
            })
          );
          break;

        case "profesores":
          response = await callApi(() =>
            api.post(ENDPOINTS.TEACHER_ASSIGNMENT_REPORT, {
              Grado: filtrosLimpios.Grado,
              Seccion: filtrosLimpios.Seccion,
            })
          );
          break;

        default:
          return;
      }

      console.log("Respuesta completa del reporte:", response);

      if (response && Array.isArray(response)) {
        if (response.length === 0) {
          setReportData([]);
        } else {
          setReportData(response);
        }
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          setReportData(response.data.length === 0 ? [] : response.data);
        } else {
          setReportData([]);
        }
      } else {
        setReportData([]);
      }
    } catch (err) {
      console.error("Error generando reporte:", err);

      // Manejar errores específicos
      if (err.response && err.response.status === 404) {
        setReportData([]);
        // No mostramos error para 404, solo datos vacíos
        clearError();
      } else {
        setReportData(null);
      }
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
    clearError();
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

  // Renderizar tabla con mensaje amigable para datos vacíos
  const renderTable = () => {
    if (!reportData) {
      return null;
    }

    if (!Array.isArray(reportData) || reportData.length === 0) {
      return (
        <div className="no-data-message">
          <div className="no-data-icon">📭</div>
          <h3>No se encontraron datos</h3>
          <p>
            {reportType === "profesores"
              ? "No hay asignaciones de profesores para los filtros seleccionados."
              : "No hay registros que coincidan con los filtros aplicados."}
          </p>
          <p className="no-data-suggestion">
            Intenta con diferentes filtros o verifica que los datos existan en
            el sistema.
          </p>
        </div>
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

      {reportData !== null && (
        <div className="report-results">
          <div className="report-header">
            <h3>
              {reportType === "gradoSeccion" &&
                "📊 Reporte por Grado y Sección"}
              {reportType === "gradoSeccionCurso" &&
                "📚 Reporte por Grado, Sección y Curso"}
              {reportType === "profesores" && "👨‍🏫 Asignación de Profesores"}
              {Array.isArray(reportData) && reportData.length > 0 && (
                <span className="record-count">
                  ({reportData.length} registros)
                </span>
              )}
            </h3>
            {Array.isArray(reportData) && reportData.length > 0 && (
              <button onClick={exportToCSV} className="btn-export">
                📥 Exportar a CSV
              </button>
            )}
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
