import api, { API_ENDPOINTS } from "./api";

export const taskService = {
  // Crear tarea
  async createTask(taskData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_TASK, taskData);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear tarea");
    }
  },

  // Obtener tareas con filtros
  async getTasks(filters = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.GET_TASKS, filters);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener tareas");
    }
  },

  // Actualizar tarea
  async updateTask(taskData) {
    try {
      const response = await api.post(API_ENDPOINTS.UPDATE_TASK, taskData);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al actualizar tarea");
    }
  },

  // Eliminar tarea
  async deleteTask(taskId) {
    try {
      console.log("🗑️ Eliminando tarea ID:", taskId);

      // Preparar datos según el formato que espera el endpoint
      const deleteData = {
        TareaID: parseInt(taskId), // Asegurar que sea número
      };

      console.log("📤 Datos enviados para eliminar:", deleteData);

      const response = await api.post(API_ENDPOINTS.ELIMINAR_TAREA, deleteData);

      console.log("✅ Tarea eliminada exitosamente:", response);
      return response;
    } catch (error) {
      console.error("❌ Error completo en deleteTask:", error);

      // Mejor manejo de errores
      if (error.response) {
        console.error("📋 Detalles del error:", {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
        });

        // Mensajes específicos según el código de error
        if (error.response.status === 400) {
          throw new Error("Solicitud incorrecta. Verifique el ID de la tarea.");
        } else if (error.response.status === 404) {
          throw new Error("Tarea no encontrada.");
        } else if (error.response.status === 403) {
          throw new Error("No tiene permisos para eliminar esta tarea.");
        } else {
          throw new Error(
            error.response.data?.mensaje ||
              error.response.data?.message ||
              "Error al eliminar tarea"
          );
        }
      } else if (error.request) {
        throw new Error("No se pudo conectar con el servidor.");
      } else {
        throw new Error(error.mensaje || "Error al eliminar tarea");
      }
    }
  },
};
