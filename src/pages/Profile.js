// src/pages/Profile.js
import React from "react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <h1>Mi Perfil</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <h2>
            {user?.primerNombre} {user?.primerApellido}
          </h2>
          <p className="profile-role">{user?.rolNombre}</p>
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div className="info-group">
            <label>Teléfono:</label>
            <span>{user?.telefono || "No especificado"}</span>
          </div>
          <div className="info-group">
            <label>Dirección:</label>
            <span>{user?.direccion || "No especificada"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
