import React from "react";
import { useAuth } from "../context/AuthContext";
import "./Welcome.css";

const Welcome = () => {
  const { user } = useAuth();

  const getRoleDescription = () => {
    switch (user?.role) {
      case "admin":
        return "Tienes acceso completo al sistema para gestionar estudiantes, cursos, calificaciones y comunicación.";
      case "docente":
        return "Puedes gestionar tareas, calificaciones de tus estudiantes y enviar comunicados.";
      case "estudiante":
        return "Puedes ver tus calificaciones, tareas asignadas y comunicados recibidos.";
      default:
        return "";
    }
  };

  // Crear el título de bienvenida
  const welcomeTitle = user?.nombre
    ? `Bienvenido, ${user.nombre}`
    : "Bienvenido";

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>{welcomeTitle}</h1>
        <p>Escuela Oficial Urbana Mixta Cantonal Bilingüe Chay B'alam</p>
        <p>San Andrés Iztapa, Chimaltenango</p>
        {user && (
          <div className="user-role-info">
            <p>
              <strong>Rol:</strong> {user.role}
            </p>
            <p>{getRoleDescription()}</p>
          </div>
        )}
      </div>

      <div className="welcome-features">
        <h2>Funcionalidades Disponibles</h2>
        <div className="features-grid">
          {/* Mostrar solo las funcionalidades según el rol */}
          {(user?.role === "admin" || user?.role === "docente") && (
            <div className="feature-card">
              <h3>Gestión de Estudiantes</h3>
              <p>Registro y administración de información estudiantil</p>
            </div>
          )}

          {user?.role === "admin" && (
            <div className="feature-card">
              <h3>Control de Cursos</h3>
              <p>Administración de cursos y secciones</p>
            </div>
          )}

          {user?.role === "docente" && (
            <div className="feature-card">
              <h3>Asignación de Tareas</h3>
              <p>Creación y seguimiento de tareas académicas</p>
            </div>
          )}

          <div className="feature-card">
            <h3>
              {user?.role === "estudiante"
                ? "Mis Calificaciones"
                : "Registro de Calificaciones"}
            </h3>
            <p>
              {user?.role === "estudiante"
                ? "Consulta tus calificaciones y estado académico"
                : "Sistema completo de evaluación y calificación"}
            </p>
          </div>

          {(user?.role === "admin" || user?.role === "docente") && (
            <div className="feature-card">
              <h3>Comunicación Institucional</h3>
              <p>Envío de comunicados a estudiantes y padres</p>
            </div>
          )}

          <div className="feature-card">
            <h3>Información Institucional</h3>
            <p>Consulta información general de la escuela</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
