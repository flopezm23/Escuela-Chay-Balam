import api, { API_ENDPOINTS } from "./api";

export const gradeSectionService = {
  // Grados
  async createGrade(gradeData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_GRADE, {
        NombreGrado: gradeData.NombreGrado,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear grado");
    }
  },

  async getGrades(filters = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.GET_GRADES, filters);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener grados");
    }
  },

  async updateGrade(gradeData) {
    try {
      const response = await api.post(API_ENDPOINTS.UPDATE_GRADE, {
        GradoID: parseInt(gradeData.GradoID),
        NombreGrado: gradeData.NombreGrado,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al actualizar grado");
    }
  },

  async deleteGrade(gradeId) {
    try {
      const response = await api.post(API_ENDPOINTS.DELETE_GRADE, {
        GradoID: parseInt(gradeId),
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al eliminar grado");
    }
  },

  // Secciones
  async createSection(sectionData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_SECTION, {
        GradoID: parseInt(sectionData.GradoID),
        NombreSeccion: sectionData.NombreSeccion,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear sección");
    }
  },

  async getSections(filters = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.GET_SECTIONS, filters);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener secciones");
    }
  },

  async updateSection(sectionData) {
    try {
      const response = await api.post(API_ENDPOINTS.UPDATE_SECTION, {
        SeccionID: parseInt(sectionData.SeccionID),
        NombreSeccion: sectionData.NombreSeccion,
        GradoID: parseInt(sectionData.GradoID),
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al actualizar sección");
    }
  },

  async deleteSection(sectionId) {
    try {
      const response = await api.post(API_ENDPOINTS.DELETE_SECTION, {
        SeccionID: parseInt(sectionId),
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al eliminar sección");
    }
  },

  // Asignaciones
  async createAssignment(assignmentData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_ASSIGNMENT, {
        UsuarioID: parseInt(assignmentData.UsuarioID),
        GradoID: parseInt(assignmentData.GradoID),
        SeccionID: parseInt(assignmentData.SeccionID),
        CursoID: parseInt(assignmentData.CursoID),
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear asignación");
    }
  },
};
