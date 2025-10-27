import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    console.log("🔐 Iniciando login con:", { email, password });

    try {
      const response = await authService.login(email, password);
      console.log("✅ Respuesta completa del login:", response);

      // DEBUG: Mostrar estructura completa
      console.log("🔍 Estructura de la respuesta:");
      console.log("- ¿Tiene correo?:", !!response.correo);
      console.log("- ¿Tiene nombre?:", !!response.nombre);
      console.log("- ¿Tiene apellido?:", !!response.apellido);
      console.log("- ¿Tiene rol?:", !!response.rol);
      console.log("- Todas las propiedades:", Object.keys(response));

      // El API está devolviendo: {correo, nombre, apellido, rol}
      if (response && response.correo && response.rol) {
        // Parsear nombre y apellido (vienen como "Mynor Styven" y "Sinay Alvarez")
        const nombres = response.nombre ? response.nombre.split(" ") : ["", ""];
        const apellidos = response.apellido
          ? response.apellido.split(" ")
          : ["", ""];

        const userData = {
          usuarioId: response.usuarioId || 0, // El API podría devolver ID
          email: response.correo,
          primerNombre: nombres[0] || response.nombre || "",
          segundoNombre: nombres[1] || "",
          primerApellido: apellidos[0] || response.apellido || "",
          segundoApellido: apellidos[1] || "",
          rolID: mapRoleToID(response.rol), // Convertir rol string a ID numérico
          rolNombre: response.rol,
          token: response.token || generarTokenTemporal(), // Usar token del API si existe
        };

        console.log("👤 Usuario procesado:", userData);

        setUser(userData);
        setIsAuthenticated(true);

        // Guardar en localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", userData.token);

        setLoading(false);
        return { success: true, user: userData };
      } else {
        console.error("❌ Formato de respuesta inesperado:", response);
        throw new Error(
          response?.mensaje || "Formato de respuesta inesperado del servidor"
        );
      }
    } catch (error) {
      console.error("❌ Error completo en login:", error);
      setLoading(false);
      setIsAuthenticated(false);
      return {
        success: false,
        error: error.message || "Error al iniciar sesión",
      };
    }
  };

  // Convertir rol string a ID numérico - MEJORADO
  const mapRoleToID = (rolString) => {
    const roleMap = {
      administrador: 1,
      profesor: 2,
      docente: 2,
      alumno: 3,
      estudiante: 3,
      "personal de desarrollo": 4,
      desarrollo: 4,
      coordinador: 5,
    };

    // Normalizar el string (minúsculas, sin espacios extras)
    const normalizedRole = rolString.toLowerCase().trim();
    return roleMap[normalizedRole] || 3; // Default a estudiante si no se encuentra
  };

  // Generar token temporal (solo si el API no lo devuelve)
  const generarTokenTemporal = () => {
    return (
      "temp_token_" +
      Math.random().toString(36).substr(2) +
      Date.now().toString(36)
    );
  };

  // Obtener nombre del rol para mostrar
  const getRoleName = (rolID) => {
    const roleNames = {
      1: "Administrador",
      2: "Profesor",
      3: "Alumno",
      4: "Personal de Desarrollo",
      5: "Coordinador",
    };
    return roleNames[rolID] || "Usuario";
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  // Verificar si hay usuario en localStorage al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log("🔄 Usuario cargado desde localStorage:", userData);
      } catch (error) {
        console.error("❌ Error parsing saved user:", error);
        logout();
      }
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin: user?.rolID === 1,
    isDocente: user?.rolID === 2,
    isEstudiante: user?.rolID === 3,
    isDesarrollo: user?.rolID === 4,
    isCoordinador: user?.rolID === 5,
    getRoleName,
    canManageUsers: user?.rolID === 1 || user?.rolID === 5,
    canManageCourses: user?.rolID === 1 || user?.rolID === 5,
    canManageTasks: user?.rolID === 1 || user?.rolID === 2 || user?.rolID === 5,
    canGrade: user?.rolID === 1 || user?.rolID === 2 || user?.rolID === 5,
    canViewReports: user?.rolID === 1 || user?.rolID === 5,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
