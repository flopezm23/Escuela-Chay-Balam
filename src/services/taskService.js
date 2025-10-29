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
async deleteTask(dataOrId, endpoint = API_ENDPOINTS.ELIMINAR_TAREA) {
  try {
    // Detectar si recibimos un número o un objeto
    const tareaId =
      typeof dataOrId === "object" ? dataOrId.TareaID : parseInt(dataOrId);

    if (isNaN(tareaId)) throw new Error("ID de tarea inválido");

    const deleteData = { TareaID: tareaId };
    console.log("🗑️ Eliminando tarea...");
    console.log("📤 Endpoint:", endpoint);
    console.log("📦 Datos enviados:", deleteData);

    // Ejecutar POST hacia el endpoint configurado
    const response = await api.post(endpoint, deleteData);

    console.log("✅ Respuesta del servidor:", response);
    return response;
  } catch (error) {
    console.error("❌ Error completo en deleteTask:", error);

    if (error.response) {
      console.error("📋 Detalles del error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });

      if (error.response.status === 400) {
        throw new Error("Solicitud incorrecta. Verifique el ID de la tarea.");
      } else if (error.response.status === 404) {
        throw new Error("Tarea no encontrada.");
      } else if (error.response.status === 409) {
        throw new Error(
          "La tarea no puede eliminarse porque tiene dependencias."
        );
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
