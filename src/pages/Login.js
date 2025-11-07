import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import "./Login.css";

// Función de validación de email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Formato de correo electrónico inválido";
  }

  const domain = email.split("@")[1].toLowerCase();

  // Permitir cualquier subdominio de miumg.edu.gt
  if (domain.endsWith(".miumg.edu.gt")) {
    return "";
  }

  // Lista de otros dominios permitidos
  const ALLOWED_DOMAINS = [
    "gmail.com",
    "hotmail.com",
    "outlook.com",
    "yahoo.com",
  ];

  if (!ALLOWED_DOMAINS.includes(domain)) {
    return `Dominio no permitido. Usa correos de miumg.edu.gt o servicios comunes`;
  }

  return "";
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

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

    // Validar email en tiempo real
    if (name === "email") {
      const validationError = validateEmail(value);
      setEmailError(validationError);
    }

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar email antes de enviar
    const emailValidationError = validateEmail(formData.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    console.log("Intentando login con:", formData);

    const result = await login(formData.email, formData.password);
    console.log("Resultado del login:", result);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  // Credenciales de prueba
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
    setEmailError(""); // Limpiar error al llenar con demo
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
              placeholder="usuario@miumg.edu.gt"
              className={emailError ? "input-error" : ""}
            />
            {emailError && (
              <div className="field-error-message">{emailError}</div>
            )}
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
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-login"
            disabled={loading || emailError}
          >
            {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="demo-section">
          <h3>Usuario de Prueba acceso administrador</h3>
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
