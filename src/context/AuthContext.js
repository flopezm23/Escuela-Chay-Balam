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
    console.log("Iniciando login con:", { email, password });

    try {
      const response = await authService.login(email, password);
      console.log("Respuesta completa del login:", response);

      // Verificar diferentes formatos de respuesta exitosa
      if (
        response &&
        (response.success === true || response.token || response.usuarioId)
      ) {
        let userData;

        // Caso 1: Respuesta con estructura { success: true, data: {...} }
        if (response.success && response.data) {
          userData = {
            usuarioId: response.data.usuarioId,
            email: response.data.email,
            primerNombre: response.data.primerNombre,
            segundoNombre: response.data.segundoNombre,
            primerApellido: response.data.primerApellido,
            segundoApellido: response.data.segundoApellido,
            rolID: response.data.rolID,
            rol: mapRole(response.data.rolID),
            token: response.token || response.data.token,
          };
        }
        // Caso 2: Respuesta directa con campos en el root
        else if (response.usuarioId) {
          userData = {
            usuarioId: response.usuarioId,
            email: response.email,
            primerNombre: response.primerNombre,
            segundoNombre: response.segundoNombre,
            primerApellido: response.primerApellido,
            segundoApellido: response.segundoApellido,
            rolID: response.rolID,
            rol: mapRole(response.rolID),
            token: response.token,
          };
        }
        // Caso 3: Solo token (formato mínimo)
        else if (response.token) {
          userData = {
            usuarioId: response.usuarioId || 0,
            email: email,
            primerNombre: "Usuario",
            primerApellido: "Sistema",
            rolID: response.rolID || 1,
            rol: mapRole(response.rolID || 1),
            token: response.token,
          };
        }

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);

          // Guardar en localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          if (userData.token) {
            localStorage.setItem("authToken", userData.token);
          }

          setLoading(false);
          return { success: true, user: userData };
        }
      }

      // Si llegamos aquí, la respuesta no tiene el formato esperado
      throw new Error(response?.mensaje || "Formato de respuesta inesperado");
    } catch (error) {
      console.error("Error completo en login:", error);
      setLoading(false);
      setIsAuthenticated(false);
      return {
        success: false,
        error: error.message || "Error al iniciar sesión",
      };
    }
  };

  // Mapear roles por ID numérico
  const mapRole = (rolID) => {
    const roleMap = {
      1: "admin",
      2: "docente",
      3: "estudiante",
      4: "desarrollo",
      5: "coordinador",
    };
    return roleMap[rolID] || "estudiante";
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
      } catch (error) {
        console.error("Error parsing saved user:", error);
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
