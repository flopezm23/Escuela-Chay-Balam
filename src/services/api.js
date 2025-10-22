import axios from "axios";
import API_BASE_URL, { API_ENDPOINTS } from "./apiConfig";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token a las requests (si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    // El API puede devolver directamente los datos o con estructura { data, success, mensaje }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Mejor manejo de errores
    const errorMessage =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      error.message ||
      "Error de conexión";

    return Promise.reject({
      mensaje: errorMessage,
      status: error.response?.status,
    });
  }
);

export { API_ENDPOINTS };
export default api;
