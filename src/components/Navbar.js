import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, getRoleName } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h2>Sistema Escolar Chay B'alam</h2>
        </Link>
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

        {/* Reportes - Solo Admin y Coordinador */}
        {(user?.rolID === 1 || user?.rolID === 5) && (
          <li className="nav-item">
            <Link to="/reports" className={`nav-link ${isActive("/reports")}`}>
              <i className="fas fa-chart-bar"></i> Reportes
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

      {/* Menú de perfil */}
      <div className="navbar-user" ref={profileRef}>
        <div className="user-profile" onClick={toggleProfileMenu}>
          <div className="user-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="user-info">
            <span className="user-name">
              {user?.primerNombre} {user?.primerApellido}
            </span>
            <span className="user-role">{getRoleName(user?.rolID)}</span>
          </div>
          <i className={`fas fa-chevron-${isProfileOpen ? "up" : "down"}`}></i>
        </div>

        {isProfileOpen && (
          <div className="profile-menu">
            <Link
              to="/profile"
              className="profile-menu-item"
              onClick={() => setIsProfileOpen(false)}
            >
              <i className="fas fa-user"></i>
              <span>Mi Perfil</span>
            </Link>
            <div className="profile-menu-divider"></div>
            <button
              className="profile-menu-item btn-logout"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
