export const reportService = {
  // Reporte por grado y sección
  async getGradeSectionReport(grado = "", seccion = "") {
    try {
      console.log("Enviando request a GradoSeccion con:", {
        Grado: grado,
        Seccion: seccion,
      });
      const response = await api.post(API_ENDPOINTS.GRADE_SECTION_REPORT, {
        Grado: grado,
        Seccion: seccion,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.mensaje || "Error al generar reporte de grado y sección"
      );
    }
  },

  // Reporte por grado, sección y curso
  async getGradeSectionCourseReport(grado = "", seccion = "", curso = "") {
    try {
      console.log("Enviando request a GradoSeccionCurso con:", {
        Grado: grado,
        Seccion: seccion,
        Curso: curso,
      });
      const response = await api.post(
        API_ENDPOINTS.GRADE_SECTION_COURSE_REPORT,
        {
          Grado: grado,
          Seccion: seccion,
          Curso: curso,
        }
      );
      return response;
    } catch (error) {
      throw new Error(
        error.mensaje || "Error al generar reporte de grado, sección y curso"
      );
    }
  },

  // Reporte de profesores por grado, curso y sección
  async getTeacherAssignmentReport(grado = "", seccion = "") {
    try {
      console.log("Enviando request a ProfeXGradoCursoSeccion con:", {
        Grado: grado,
        Seccion: seccion,
      });
      const response = await api.post(API_ENDPOINTS.TEACHER_ASSIGNMENT_REPORT, {
        Grado: grado,
        Seccion: seccion,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.mensaje || "Error al generar reporte de asignación de profesores"
      );
    }
  },
};
