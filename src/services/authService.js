import api, { API_ENDPOINTS } from "./api";

export const authService = {
  // Login - MEJORADO
  async login(email, password) {
    try {
      console.log("🔐 Enviando login al API:", {
        Email: email,
        Contrasenia: password,
        endpoint: API_ENDPOINTS.LOGIN,
      });

      const response = await api.post(API_ENDPOINTS.LOGIN, {
        Email: email,
        Contrasenia: password,
      });

      console.log("✅ Respuesta del API:", response);

      // Si la respuesta es exitosa pero viene con mensaje de error
      if (response && response.mensaje && !response.correo) {
        throw new Error(response.mensaje);
      }

      return response;
    } catch (error) {
      console.error("❌ Error en authService.login:", error);

      // Mejor manejo de errores
      if (error.mensaje) {
        throw new Error(error.mensaje);
      } else if (error.response && error.response.data) {
        throw new Error(
          error.response.data.mensaje ||
            error.response.data.message ||
            "Error al iniciar sesión"
        );
      } else {
        throw new Error(error.message || "Error al iniciar sesión");
      }
    }
  },

  // ... resto de los métodos permanecen igual
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

  async getUsers(filters = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.GET_USERS, filters);
      return response;
    } catch (error) {
      throw new Error(error.mensaje || "Error al obtener usuarios");
    }
  },

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

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};
