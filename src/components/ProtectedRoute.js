import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles.length > 0 && user?.rolID) {
    const hasAllowedRole = allowedRoles.includes(user.rolID);

    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
