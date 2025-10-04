import api, { API_ENDPOINTS } from "./api";

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        Email: email,
        Contrasenia: password,
      });

      // Guardar token en localStorage
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }

      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al iniciar sesión");
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, {
        Email: email,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al reiniciar contraseña");
    }
  },

  // Crear usuario
  async createUser(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_USER, userData);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear usuario");
    }
  },

  // Actualizar usuario
  async updateUser(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.UPDATE_USER, userData);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al actualizar usuario");
    }
  },

  // Obtener usuarios
  async getUsers() {
    try {
      const response = await api.post(API_ENDPOINTS.GET_USERS, {});
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener usuarios");
    }
  },

  // Logout
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};
