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
import MassNotifications from "./pages/MassNotifications"; // Nuevo import
import Information from "./pages/Information";
import UserManagement from "./pages/UserManagement";
import "./App.css";

// Componente para redirigir según el rol
const RoleBasedRedirect = () => {
  const { user } = useAuth();

  // Redirigir según el RolID
  if (user?.rolID === 3) {
    // Estudiante
    return <Navigate to="/grades" replace />;
  } else if (user?.rolID === 2 || user?.rolID === 5) {
    // Profesor o Coordinador
    return <Navigate to="/tasks" replace />;
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

          {/* Gestión de Estudiantes - Admin y Coordinador */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={[1, 5]}>
                {" "}
                {/* Admin y Coordinador */}
                <Students />
              </ProtectedRoute>
            }
          />

          {/* Gestión de Cursos - Admin y Coordinador */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={[1, 5]}>
                {" "}
                {/* Admin y Coordinador */}
                <Courses />
              </ProtectedRoute>
            }
          />

          {/* Gestión de Tareas - Admin, Profesor y Coordinador */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 5]}>
                {" "}
                {/* Admin, Profesor y Coordinador */}
                <Tasks />
              </ProtectedRoute>
            }
          />

          {/* Calificaciones - Todos los roles excepto Desarrollo */}
          <Route
            path="/grades"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 5]}>
                {" "}
                {/* Admin, Profesor, Estudiante y Coordinador */}
                <Grades />
              </ProtectedRoute>
            }
          />

          {/* Comunicación Interna - Admin, Profesor y Coordinador */}
          <Route
            path="/communication"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 5]}>
                {" "}
                {/* Admin, Profesor y Coordinador */}
                <Communication />
              </ProtectedRoute>
            }
          />

          {/* Avisos Masivos - Admin y Coordinador */}
          <Route
            path="/mass-notifications"
            element={
              <ProtectedRoute allowedRoles={[1, 5]}>
                {" "}
                {/* Admin y Coordinador */}
                <MassNotifications />
              </ProtectedRoute>
            }
          />

          {/* Información - Todos los usuarios autenticados */}
          <Route
            path="/information"
            element={
              <ProtectedRoute>
                <Information />
              </ProtectedRoute>
            }
          />

          {/* Gestión de Usuarios - Solo Admin */}
          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                {" "}
                {/* Solo Admin */}
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
