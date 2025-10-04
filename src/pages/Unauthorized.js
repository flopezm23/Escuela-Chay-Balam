import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./Unauthorized.css";

const Unauthorized = () => {
  const { user, logout } = useAuth();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="icon">🚫</div>
        <h1>Acceso No Autorizado</h1>
        <p>
          Lo sentimos, <strong>{user?.nombre}</strong> no tiene permisos para
          acceder a esta página con el rol de <strong>{user?.role}</strong>.
        </p>

        <div className="permissions-info">
          <h3>Permisos por rol:</h3>
          <ul>
            <li>
              <strong>Administrador:</strong> Acceso completo a todas las
              funciones
            </li>
            <li>
              <strong>Docente:</strong> Gestión de tareas, calificaciones y
              comunicación con sus cursos
            </li>
            <li>
              <strong>Estudiante:</strong> Ver sus calificaciones, tareas y
              comunicados
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
