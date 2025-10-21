import api, { API_ENDPOINTS } from "./api";

export const taskService = {
  // Crear tarea
  async createTask(taskData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_TASK, {
        CursoID: parseInt(taskData.CursoID),
        GradoID: parseInt(taskData.GradoID),
        SeccionID: parseInt(taskData.SeccionID),
        Titulo: taskData.Titulo,
        Descripcion: taskData.Descripcion,
        FechaEntrega: taskData.FechaEntrega,
        PunteoTarea: parseFloat(taskData.PunteoTarea), // Nuevo campo
      });
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
      const response = await api.post(API_ENDPOINTS.UPDATE_TASK, {
        TareaID: parseInt(taskData.TareaID),
        Titulo: taskData.Titulo,
        Descripcion: taskData.Descripcion,
        FechaEntrega: taskData.FechaEntrega,
        PunteoTarea: taskData.PunteoTarea
          ? parseFloat(taskData.PunteoTarea)
          : undefined,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al actualizar tarea");
    }
  },

  // Eliminar tarea
  async deleteTask(taskId) {
    try {
      const response = await api.post(API_ENDPOINTS.DELETE_TASK, {
        TareaID: parseInt(taskId),
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al eliminar tarea");
    }
  },
};
