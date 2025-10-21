import api, { API_ENDPOINTS } from "./api";

export const gradingService = {
  // Filtrar calificaciones
  async filterGrades(filters = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.FILTER_GRADES, filters);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al filtrar calificaciones");
    }
  },

  // Calificar tarea
  async gradeTask(gradeData) {
    try {
      const response = await api.post(API_ENDPOINTS.GRADE_TASK, {
        UsuarioId: parseInt(gradeData.UsuarioId),
        TareaId: parseInt(gradeData.TareaId),
        PunteoObtenido: parseFloat(gradeData.PunteoObtenido),
        Observacion: gradeData.Observacion,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al calificar tarea");
    }
  },
};
