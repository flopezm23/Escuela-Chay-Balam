import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Welcome from "./pages/Welcome";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Tasks from "./pages/Tasks";
import Grades from "./pages/Grades";
import Communication from "./pages/Communication";
import Information from "./pages/Information";
import UserManagement from "./pages/UserManagement";
import "./App.css";

// Componente para redirigir según el rol
const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "estudiante") {
    return <Navigate to="/grades" replace />;
  }

  return <Welcome />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <div className="main-content">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={["admin", "docente"]}>
                <Students />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={["admin", "docente"]}>
                <Tasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/grades"
            element={
              <ProtectedRoute allowedRoles={["admin", "docente", "estudiante"]}>
                <Grades />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communication"
            element={
              <ProtectedRoute allowedRoles={["admin", "docente"]}>
                <Communication />
              </ProtectedRoute>
            }
          />

          <Route
            path="/information"
            element={
              <ProtectedRoute>
                <Information />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
