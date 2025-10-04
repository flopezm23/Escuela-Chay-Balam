import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir a la página principal
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  // Credenciales de prueba de la API real
  const demoUsers = [
    {
      role: "Administrador",
      email: "msinaya2@miumg.edu.gt",
      password: "T2eP+Hge",
      description: "Usuario administrador con acceso completo",
    },
  ];

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Sistema de Gestión Escolar Chay B'alam</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="demo-section">
          <h3>Usuario de Prueba (API Real)</h3>
          <div className="demo-users">
            {demoUsers.map((user, index) => (
              <button
                key={index}
                type="button"
                className="demo-btn"
                onClick={() => fillDemoCredentials(user.email, user.password)}
                disabled={loading}
              >
                <strong>{user.role}</strong>
                <span>{user.email}</span>
                <small>{user.description}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
