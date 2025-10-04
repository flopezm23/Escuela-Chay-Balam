import React, { useState } from "react";
import "./Grades.css";
import { useAuth } from "../context/AuthContext";

const Grades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [formData, setFormData] = useState({
    estudiante: "",
    curso: "",
    periodo: "",
    tipoEvaluacion: "",
    calificacion: "",
    observaciones: "",
  });

  const pageTitle =
    user?.role === "estudiante"
      ? "Mis Calificaciones"
      : "Gestión de Calificaciones";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de guardado
    const newGrade = {
      id: grades.length + 1,
      ...formData,
      fechaRegistro: new Date().toLocaleDateString(),
    };
    setGrades([...grades, newGrade]);

    // Limpiar formulario
    setFormData({
      estudiante: "",
      curso: "",
      periodo: "",
      tipoEvaluacion: "",
      calificacion: "",
      observaciones: "",
    });

    alert("Calificación registrada exitosamente");
  };

  // Función para calcular el estado (Aprobado/Reprobado)
  const getStatus = (calificacion) => {
    const nota = parseInt(calificacion);
    return nota >= 61 ? "Aprobado" : "Reprobado";
  };

  // Función para obtener la clase CSS según el estado
  const getStatusClass = (calificacion) => {
    const nota = parseInt(calificacion);
    return nota >= 61 ? "aprobado" : "reprobado";
  };

  return (
    <div className="grades-container">
      <h1>{pageTitle}</h1>

      {/* CORRECCIÓN: Mostrar formulario SOLO si NO es estudiante */}
      {user?.role !== "estudiante" && (
        <div className="grades-form">
          <h2>Registrar Calificación</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Estudiante:</label>
                <select
                  name="estudiante"
                  value={formData.estudiante}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  <option value="juan-perez">Juan Pérez</option>
                  <option value="maria-garcia">María García</option>
                  <option value="carlos-lopez">Carlos López</option>
                  <option value="ana-martinez">Ana Martínez</option>
                  <option value="luis-rodriguez">Luis Rodríguez</option>
                </select>
              </div>
              <div className="form-group">
                <label>Curso:</label>
                <select
                  name="curso"
                  value={formData.curso}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar curso</option>
                  <option value="matematicas">Matemáticas</option>
                  <option value="lenguaje">Lenguaje y Literatura</option>
                  <option value="ciencias">Ciencias Naturales</option>
                  <option value="sociales">Ciencias Sociales</option>
                  <option value="ingles">Inglés</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Período:</label>
                <select
                  name="periodo"
                  value={formData.periodo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar período</option>
                  <option value="q1">Primer Quimestre</option>
                  <option value="q2">Segundo Quimestre</option>
                  <option value="final">Evaluación Final</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Evaluación:</label>
                <select
                  name="tipoEvaluacion"
                  value={formData.tipoEvaluacion}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="tarea">Tarea</option>
                  <option value="examen-parcial">Examen Parcial</option>
                  <option value="proyecto">Proyecto</option>
                  <option value="participacion">Participación</option>
                  <option value="examen-final">Examen Final</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Calificación (0-100):</label>
                <input
                  type="number"
                  name="calificacion"
                  value={formData.calificacion}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <input
                  type="text"
                  value={
                    formData.calificacion
                      ? getStatus(formData.calificacion)
                      : ""
                  }
                  readOnly
                  className={`status-input ${
                    formData.calificacion
                      ? getStatusClass(formData.calificacion)
                      : ""
                  }`}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observaciones:</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows="3"
                placeholder="Observaciones adicionales..."
              ></textarea>
            </div>

            <button type="submit" className="btn-primary">
              Registrar Calificación
            </button>
          </form>
        </div>
      )}

      <div className="grades-list">
        <h2>
          {user?.role === "estudiante"
            ? "Mis Calificaciones"
            : "Registro de Calificaciones"}{" "}
          ({grades.length})
        </h2>
        {grades.length === 0 ? (
          <p className="no-data">No hay calificaciones registradas</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Curso</th>
                  <th>Período</th>
                  <th>Evaluación</th>
                  <th>Calificación</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  {user?.role !== "estudiante" && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id}>
                    <td>{grade.estudiante}</td>
                    <td>{grade.curso}</td>
                    <td>{grade.periodo}</td>
                    <td>{grade.tipoEvaluacion}</td>
                    <td>{grade.calificacion}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          grade.calificacion
                        )}`}
                      >
                        {getStatus(grade.calificacion)}
                      </span>
                    </td>
                    <td>{grade.fechaRegistro}</td>
                    {user?.role !== "estudiante" && (
                      <td>
                        <button className="btn-edit">Editar</button>
                        <button className="btn-delete">Eliminar</button>
                      </td>
                    )}
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
