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
import MassNotifications from "./pages/MassNotifications";
import Information from "./pages/Information";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";
import "./App.css";
import Profile from "./pages/Profile";

// Componente simplificado para evitar errores
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <div className="main-content">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Ruta principal protegida */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4, 5]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Otras rutas protegidas - versión simplificada */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={[1, 5]}>
                <Students />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={[1, 5]}>
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 5]}>
                <Tasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/grades"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 5]}>
                <Grades />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communication"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 5]}>
                <Communication />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mass-notifications"
            element={
              <ProtectedRoute allowedRoles={[1, 5]}>
                <MassNotifications />
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
              <ProtectedRoute allowedRoles={[1]}>
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
};

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
