import api, { API_ENDPOINTS } from "./api";

export const gradeSectionService = {
  // Grados
  async createGrade(gradeData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_GRADE, {
        NombreGrado: gradeData.nombreGrado,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear grado");
    }
  },

  async getGrades() {
    try {
      const response = await api.post(API_ENDPOINTS.GET_GRADES, {});
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener grados");
    }
  },

  // Secciones
  async createSection(sectionData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_SECTION, {
        GradoID: sectionData.gradoID,
        NombreSeccion: sectionData.nombreSeccion,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear sección");
    }
  },

  async getSections() {
    try {
      const response = await api.post(API_ENDPOINTS.GET_SECTIONS, {});
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener secciones");
    }
  },

  // Asignaciones
  async createAssignment(assignmentData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_ASSIGNMENT, {
        UsuarioID: assignmentData.usuarioID,
        GradoID: assignmentData.gradoID,
        SeccionID: assignmentData.seccionID,
        CursoID: assignmentData.cursoID,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear asignación");
    }
  },
};
