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
      const response = await api.post(API_ENDPOINTS.CREATE_USER, {
        PrimerNombre: userData.PrimerNombre,
        SegundoNombre: userData.SegundoNombre,
        PrimerApellido: userData.PrimerApellido,
        SegundoApellido: userData.SegundoApellido,
        Email: userData.Email,
        RolID: userData.RolID,
        Contrasena: userData.Contrasena,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al crear usuario");
    }
  },

  // Actualizar usuario
  async updateUser(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.UPDATE_USER, {
        PrimerNombre: userData.PrimerNombre,
        SegundoNombre: userData.SegundoNombre,
        PrimerApellido: userData.PrimerApellido,
        SegundoApellido: userData.SegundoApellido,
        Email: userData.Email,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al actualizar usuario");
    }
  },

  // Obtener usuarios con filtros
  async getUsers(filters = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.GET_USERS, filters);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener usuarios");
    }
  },

  // Enviar avisos masivos
  async sendMassNotification(avisoData) {
    try {
      const response = await api.post(API_ENDPOINTS.SEND_NOTIFICATIONS, {
        Asunto: avisoData.Asunto,
        Mensaje: avisoData.Mensaje,
      });
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al enviar avisos");
    }
  },

  // Logout
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};
