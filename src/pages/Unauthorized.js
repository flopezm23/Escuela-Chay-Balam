import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./Unauthorized.css";

const Unauthorized = () => {
  const { user, logout } = useAuth();

  const getRoleName = (rolID) => {
    const roles = {
      1: "Administrador",
      2: "Profesor",
      3: "Alumno",
      4: "Personal de Desarrollo",
      5: "Coordinador",
    };
    return roles[rolID] || "Usuario";
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="icon">🚫</div>
        <h1>Acceso No Autorizado</h1>
        <p>
          Lo sentimos,{" "}
          <strong>
            {user?.primerNombre} {user?.primerApellido}
          </strong>{" "}
          no tiene permisos para acceder a esta página con el rol de{" "}
          <strong>{getRoleName(user?.rolID)}</strong>.
        </p>

        <div className="permissions-info">
          <h3>Permisos por rol:</h3>
          <ul>
            <li>
              <strong>Administrador (1):</strong> Acceso completo a todas las
              funciones
            </li>
            <li>
              <strong>Profesor (2):</strong> Gestión de tareas, calificaciones y
              comunicación con sus cursos
            </li>
            <li>
              <strong>Alumno (3):</strong> Ver sus calificaciones, tareas y
              comunicados
            </li>
            <li>
              <strong>Coordinador (5):</strong> Gestión de usuarios, cursos y
              reportes
            </li>
            <li>
              <strong>Personal de Desarrollo (4):</strong> Acceso técnico al
              sistema
            </li>
          </ul>
        </div>

        <div className="action-buttons">
          <Link to="/" className="btn-primary">
            Ir al Inicio
          </Link>
          <button onClick={logout} className="btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
