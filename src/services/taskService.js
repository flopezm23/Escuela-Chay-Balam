import api, { API_ENDPOINTS } from "./api";

export const taskService = {
  // Consultar tareas
  async getTasks(filters = {}) {
    try {
      console.log("Consultando tareas con filtros:", filters);
      const response = await api.post(API_ENDPOINTS.CONSULTAR_TAREAS, filters);
      console.log("Respuesta de consultar tareas:", response);
      return response;
    } catch (error) {
      console.error("Error en getTasks:", error);
      throw new Error(error.mensaje || "Error al consultar tareas");
    }
  },

  // Crear tarea
  async createTask(taskData) {
    try {
      console.log("Creando tarea:", taskData);
      const response = await api.post(API_ENDPOINTS.CREAR_TAREA, taskData);
      return response;
    } catch (error) {
      console.error("Error en createTask:", error);
      throw new Error(error.mensaje || "Error al crear tarea");
    }
  },

  // Actualizar tarea
  async updateTask(taskData) {
    try {
      console.log("Actualizando tarea:", taskData);
      const response = await api.post(API_ENDPOINTS.ACTUALIZAR_TAREA, taskData);
      return response;
    } catch (error) {
      console.error("Error en updateTask:", error);
      throw new Error(error.mensaje || "Error al actualizar tarea");
    }
  },

  // Eliminar tarea
  async deleteTask(taskData) {
    try {
      console.log("Eliminando tarea:", taskData);
      const response = await api.post(API_ENDPOINTS.ELIMINAR_TAREA, taskData);
      return response;
    } catch (error) {
      console.error("Error en deleteTask:", error);
      throw new Error(error.mensaje || "Error al eliminar tarea");
    }
  },
};
