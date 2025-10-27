import api, { API_ENDPOINTS } from "./api";

export const taskService = {
  // Consultar tareas - Mantén la misma estructura que tenías antes
  async getTasks(filters = {}) {
    try {
      console.log("🔍 Consultando tareas con filtros:", filters);
      const response = await api.post(API_ENDPOINTS.CONSULTAR_TAREAS, filters);
      console.log("✅ Respuesta de consultar tareas:", response);
      return response.data; // ← IMPORTANTE: Devuelve response.data
    } catch (error) {
      console.error("❌ Error en getTasks:", error);
      // Mejor manejo de errores
      if (error.response) {
        console.error("Detalles del error:", {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
        });
      }
      throw new Error(
        error.response?.data?.message ||
          error.mensaje ||
          "Error al consultar tareas"
      );
    }
  },

  // Crear tarea
  async createTask(taskData) {
    try {
      console.log("📝 Creando tarea:", taskData);
      const response = await api.post(API_ENDPOINTS.CREAR_TAREA, taskData);
      return response.data;
    } catch (error) {
      console.error("❌ Error en createTask:", error);
      throw new Error(
        error.response?.data?.message || error.mensaje || "Error al crear tarea"
      );
    }
  },

  // Actualizar tarea
  async updateTask(taskData) {
    try {
      console.log("✏️ Actualizando tarea:", taskData);
      const response = await api.post(API_ENDPOINTS.ACTUALIZAR_TAREA, taskData);
      return response.data;
    } catch (error) {
      console.error("❌ Error en updateTask:", error);
      throw new Error(
        error.response?.data?.message ||
          error.mensaje ||
          "Error al actualizar tarea"
      );
    }
  },

  // Eliminar tarea
  async deleteTask(taskData) {
    try {
      console.log("🗑️ Eliminando tarea:", taskData);
      const response = await api.post(API_ENDPOINTS.ELIMINAR_TAREA, taskData);
      return response.data;
    } catch (error) {
      console.error("❌ Error en deleteTask:", error);
      throw new Error(
        error.response?.data?.message ||
          error.mensaje ||
          "Error al eliminar tarea"
      );
    }
  },
};
