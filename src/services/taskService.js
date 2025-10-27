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
      const response = await api.post(API_ENDPOINTS.DELETE_TASK, {
        TareaID: taskId,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al eliminar tarea");
    }
  },
};
