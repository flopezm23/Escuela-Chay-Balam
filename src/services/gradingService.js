import api, { API_ENDPOINTS } from "./api";

export const gradingService = {
  // Filtrar calificaciones - el endpoint espera JSON vacío o con filtros específicos
  async filterGrades(filters = {}) {
    try {
      console.log(
        "Enviando filtros a Calificaciones/FiltroCalificaciones:",
        filters
      );
      const response = await api.post(API_ENDPOINTS.FILTER_GRADES, filters);
      console.log("Respuesta de filtro calificaciones:", response);
      return response;
    } catch (error) {
      console.error("Error en filterGrades:", error);
      throw new Error(error.mensaje || "Error al filtrar calificaciones");
    }
  },

  // Calificar tarea
  async gradeTask(gradeData) {
    try {
      console.log("Enviando calificación:", gradeData);
      const response = await api.post(API_ENDPOINTS.GRADE_TASK, gradeData);
      return response;
    } catch (error) {
      console.error("Error en gradeTask:", error);
      throw new Error(error.mensaje || "Error al calificar tarea");
    }
  },
};
