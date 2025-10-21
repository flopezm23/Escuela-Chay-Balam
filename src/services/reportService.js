import api, { API_ENDPOINTS } from "./api";

export const reportService = {
  // Reporte por grado y sección
  async getGradeSectionReport(reportData) {
    try {
      const response = await api.post(API_ENDPOINTS.GRADE_SECTION_REPORT, {
        Grado: reportData.Grado,
        Seccion: reportData.Seccion,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al generar reporte");
    }
  },

  // Reporte por grado, sección y curso
  async getGradeSectionCourseReport(reportData) {
    try {
      const response = await api.post(
        API_ENDPOINTS.GRADE_SECTION_COURSE_REPORT,
        {
          Grado: reportData.Grado,
          Seccion: reportData.Seccion,
          Curso: reportData.Curso,
        }
      );
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al generar reporte");
    }
  },

  // Reporte de profesores por grado, curso y sección
  async getTeacherAssignmentReport(reportData) {
    try {
      const response = await api.post(API_ENDPOINTS.TEACHER_ASSIGNMENT_REPORT, {
        Grado: reportData.Grado,
        Seccion: reportData.Seccion,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al generar reporte");
    }
  },
};
