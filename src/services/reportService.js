import api, { API_ENDPOINTS } from "./api";

export const reportService = {
  // Reporte por grado y sección - enviar JSON vacío
  async getGradeSectionReport() {
    try {
      console.log("Enviando request a GradoSeccion con:", {});
      const response = await api.post(API_ENDPOINTS.GRADE_SECTION_REPORT, {});
      return response;
    } catch (error) {
      throw new Error(
        error.mensaje || "Error al generar reporte de grado y sección"
      );
    }
  },

  // Reporte por grado, sección y curso - enviar JSON vacío
  async getGradeSectionCourseReport() {
    try {
      console.log("Enviando request a GradoSeccionCurso con:", {});
      const response = await api.post(
        API_ENDPOINTS.GRADE_SECTION_COURSE_REPORT,
        {}
      );
      return response;
    } catch (error) {
      throw new Error(
        error.mensaje || "Error al generar reporte de grado, sección y curso"
      );
    }
  },

  // Reporte de profesores por grado, curso y sección - enviar JSON vacío
  async getTeacherAssignmentReport() {
    try {
      console.log("Enviando request a ProfeXGradoCursoSeccion con:", {});
      const response = await api.post(
        API_ENDPOINTS.TEACHER_ASSIGNMENT_REPORT,
        {}
      );
      return response;
    } catch (error) {
      throw new Error(
        error.mensaje || "Error al generar reporte de asignación de profesores"
      );
    }
  },
};
