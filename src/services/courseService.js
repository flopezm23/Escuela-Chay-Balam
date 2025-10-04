import api, { API_ENDPOINTS } from "./api";

export const courseService = {
  // Crear curso
  async createCourse(courseData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_COURSE, {
        Nombre: courseData.nombre,
        Descripcion: courseData.descripcion,
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
        CursoID: courseData.cursoID,
        Nombre: courseData.nombre,
        Descripcion: courseData.descripcion,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al actualizar curso");
    }
  },

  // Obtener cursos
  async getCourses() {
    try {
      const response = await api.post(API_ENDPOINTS.GET_COURSES, {});
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener cursos");
    }
  },

  // Eliminar curso
  async deleteCourse(courseId) {
    try {
      const response = await api.post(API_ENDPOINTS.DELETE_COURSE, {
        CursoID: courseId,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al eliminar curso");
    }
  },
};
