// Usar variable de entorno o valor por defecto
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://escuela-c7b9badafpa4e9da.canadacentral-01.azurewebsites.net/api";

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: "/Usuarios/Login",
  RESET_PASSWORD: "/Usuarios/ReinicioPass",
  CREATE_USER: "/Usuarios/CrearUsuario",
  UPDATE_USER: "/Usuarios/ActualizarUsuario",
  GET_USERS: "/Usuarios/ConsultarUsuarios",

  // Cursos
  CREATE_COURSE: "/Cursos/CrearCurso",
  UPDATE_COURSE: "/Cursos/ActualizarCurso",
  GET_COURSES: "/Cursos/ConsultarCursos",
  DELETE_COURSE: "/Cursos/EliminarCurso",

  // Tareas
  CREATE_TASK: "/Tareas/CrearTarea",
  GET_TASKS: "/Tareas/ConsultarTareas",
  UPDATE_TASK: "/Tareas/ActualizarTarea",
  DELETE_TASK: "/Tareas/EliminarTarea",

  // Grados y Secciones
  CREATE_GRADE: "/Grados/CrearGrado",
  GET_GRADES: "/Grados/ConsultarGrados",
  CREATE_SECTION: "/Secciones/CrearSeccion",
  GET_SECTIONS: "/Secciones/ConsultarSecciones",

  // Asignaciones
  CREATE_ASSIGNMENT: "/Asignacion/Registrar",
};

export default API_BASE_URL;
