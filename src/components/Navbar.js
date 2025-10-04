import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  // Si no está autenticado, no mostrar navbar
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Escuela Bilingüe Chay B'alam</h2>
      </div>

      <ul className="navbar-nav">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/information">Información</Link>
        </li>
        {/* Solo Admin y Docente pueden gestionar estudiantes */}
        {(user?.role === "admin" || user?.role === "docente") && (
          <li>
            <Link to="/students">Estudiantes</Link>
          </li>
        )}

        {/* Solo Admin puede gestionar cursos */}
        {user?.role === "admin" && (
          <li>
            <Link to="/courses">Cursos</Link>
          </li>
        )}

        {/* Solo Docente puede gestionar tareas */}
        {(user?.role === "admin" || user?.role === "docente") && (
          <li>
            <Link to="/tasks">Tareas</Link>
          </li>
        )}

        {/* Admin y Docente gestionan calificaciones, Estudiante las ve */}
        {(user?.role === "admin" ||
          user?.role === "docente" ||
          user?.role === "estudiante") && (
          <li>
            <Link to="/grades">Calificaciones</Link>
          </li>
        )}

        {/* Solo Admin y Docente pueden enviar comunicados */}
        {(user?.role === "admin" || user?.role === "docente") && (
          <li>
            <Link to="/communication">Comunicación</Link>
          </li>
        )}
      </ul>

      <div className="user-section">
        <span className="user-info">
          <strong>{user?.nombre}</strong> ({user?.role})
        </span>
        <button onClick={logout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
