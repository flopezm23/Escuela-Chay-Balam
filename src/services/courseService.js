import api, { API_ENDPOINTS } from "./api";

export const courseService = {
  // Crear curso
  async createCourse(courseData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_COURSE, {
        Nombre: courseData.Nombre,
        Descripcion: courseData.Descripcion,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear curso");
    }
  },

  // Actualizar curso
  async updateCourse(courseData) {
    try {
      const response = await api.post(API_ENDPOINTS.UPDATE_COURSE, {
        CursoID: parseInt(courseData.CursoID),
        Nombre: courseData.Nombre,
        Descripcion: courseData.Descripcion,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al actualizar curso");
    }
  },

  // Obtener cursos con filtros
  async getCourses(filters = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.GET_COURSES, filters);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener cursos");
    }
  },

  // Eliminar curso
  async deleteCourse(courseId) {
    try {
      const response = await api.post(API_ENDPOINTS.DELETE_COURSE, {
        CursoID: parseInt(courseId),
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al eliminar curso");
    }
  },
};
