import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, getRoleName } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h2>Sistema Escolar Chay B'alam</h2>
        </Link>
      </div>

      <div className="navbar-user">
        <span className="user-info">
          {user?.primerNombre} {user?.primerApellido}
          <small>({getRoleName(user?.rolID)})</small>
        </span>
        <button onClick={logout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      <ul className="navbar-nav">
        {/* Inicio - Todos los usuarios */}
        <li className="nav-item">
          <Link to="/" className={`nav-link ${isActive("/")}`}>
            <i className="fas fa-home"></i> Inicio
          </Link>
        </li>

        {/* Gestión de Estudiantes - Solo Admin y Coordinador */}
        {(user?.rolID === 1 || user?.rolID === 5) && (
          <li className="nav-item">
            <Link
              to="/students"
              className={`nav-link ${isActive("/students")}`}
            >
              <i className="fas fa-users"></i> Estudiantes
            </Link>
          </li>
        )}

        {/* Gestión de Cursos - Solo Admin y Coordinador */}
        {(user?.rolID === 1 || user?.rolID === 5) && (
          <li className="nav-item">
            <Link to="/courses" className={`nav-link ${isActive("/courses")}`}>
              <i className="fas fa-book"></i> Cursos
            </Link>
          </li>
        )}

        {/* Gestión de Tareas - Admin, Profesor y Coordinador */}
        {(user?.rolID === 1 || user?.rolID === 2 || user?.rolID === 5) && (
          <li className="nav-item">
            <Link to="/tasks" className={`nav-link ${isActive("/tasks")}`}>
              <i className="fas fa-tasks"></i> Tareas
            </Link>
          </li>
        )}

        {/* Calificaciones - Todos excepto Desarrollo */}
        {(user?.rolID === 1 ||
          user?.rolID === 2 ||
          user?.rolID === 3 ||
          user?.rolID === 5) && (
          <li className="nav-item">
            <Link to="/grades" className={`nav-link ${isActive("/grades")}`}>
              <i className="fas fa-chart-bar"></i> Calificaciones
            </Link>
          </li>
        )}

        {/* Comunicación Interna - Admin, Profesor y Coordinador */}
        {(user?.rolID === 1 || user?.rolID === 2 || user?.rolID === 5) && (
          <li className="nav-item">
            <Link
              to="/communication"
              className={`nav-link ${isActive("/communication")}`}
            >
              <i className="fas fa-comments"></i> Comunicación
            </Link>
          </li>
        )}

        {/* Avisos Masivos - Solo Admin y Coordinador */}
        {(user?.rolID === 1 || user?.rolID === 5) && (
          <li className="nav-item">
            <Link
              to="/mass-notifications"
              className={`nav-link ${isActive("/mass-notifications")}`}
            >
              <i className="fas fa-bullhorn"></i> Avisos Masivos
            </Link>
          </li>
        )}

        {/* Gestión de Usuarios - Solo Admin */}
        {user?.rolID === 1 && (
          <li className="nav-item">
            <Link
              to="/user-management"
              className={`nav-link ${isActive("/user-management")}`}
            >
              <i className="fas fa-user-cog"></i> Usuarios
            </Link>
          </li>
        )}

        {/* Información - Todos los usuarios autenticados */}
        <li className="nav-item">
          <Link
            to="/information"
            className={`nav-link ${isActive("/information")}`}
          >
            <i className="fas fa-info-circle"></i> Información
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
