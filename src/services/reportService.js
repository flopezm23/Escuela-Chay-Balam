// src/services/optionsService.js
import api, { API_ENDPOINTS } from "./api";

export const optionsService = {
  // Obtener todos los grados únicos
  async getGrados() {
    try {
      // Si tienes un endpoint para grados, úsalo. Si no, podemos extraer de los reportes existentes
      const response = await api.get(API_ENDPOINTS.GRADOS || "/Grados");
      return response.data;
    } catch (error) {
      console.warn(
        "No se pudieron obtener los grados, usando valores por defecto"
      );
      return ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto"];
    }
  },

  // Obtener todas las secciones únicas
  async getSecciones() {
    try {
      // Si tienes un endpoint para secciones, úsalo
      const response = await api.get(API_ENDPOINTS.SECCIONES || "/Secciones");
      return response.data;
    } catch (error) {
      console.warn(
        "No se pudieron obtener las secciones, usando valores por defecto"
      );
      return ["A", "B", "C", "D"];
    }
  },

  // Obtener todos los cursos únicos
  async getCursos() {
    try {
      // Si tienes un endpoint para cursos, úsalo
      const response = await api.get(API_ENDPOINTS.CURSOS || "/Cursos");
      return response.data;
    } catch (error) {
      console.warn(
        "No se pudieron obtener los cursos, usando valores por defecto"
      );
      return ["Lengua", "Matemáticas", "Ciencias", "Historia", "Inglés"];
    }
  },

  // Método alternativo: extraer opciones de los datos existentes
  extractOptionsFromData(data, fieldName) {
    if (!Array.isArray(data)) return [];
    const uniqueValues = [
      ...new Set(data.map((item) => item[fieldName]).filter(Boolean)),
    ];
    return uniqueValues.sort();
  },
};
