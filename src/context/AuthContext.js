import React, { createContext, useState, useContext } from "react";
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

  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      const userData = {
        id: response.id,
        email: response.correo,
        nombre: response.nombre,
        apellido: response.apellido,
        role: mapRole(response.rol),
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);

      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Mapear roles de la API a los roles del frontend
  const mapRole = (apiRole) => {
    const roleMap = {
      Administrador: "admin",
      Docente: "docente",
      Estudiante: "estudiante",
    };
    return roleMap[apiRole] || "estudiante";
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Verificar si hay usuario en localStorage al cargar la app
  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isDocente: user?.role === "docente",
    isEstudiante: user?.role === "estudiante",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
