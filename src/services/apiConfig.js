// Usar variable de entorno o valor por defecto
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://escuela-c7b9badafpa4e9da.canadacentral-01.azurewebsites.net/api";

export const API_ENDPOINTS = {
  // Autenticación y Usuarios
  LOGIN: "/Usuarios/Login",
  RESET_PASSWORD: "/Usuarios/ReinicioPass",
  CREATE_USER: "/Usuarios/CrearUsuario",
  UPDATE_USER: "/Usuarios/ActualizarUsuario",
  GET_USERS: "/Usuarios/ConsultarUsuarios",
  SEND_NOTIFICATIONS: "/Usuarios/EnviarAvisosMasivos",

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

  // Grados
  CREATE_GRADE: "/Grados/CrearGrado",
  UPDATE_GRADE: "/Grados/ActualizarGrado",
  GET_GRADES: "/Grados/ConsultarGrados",
  DELETE_GRADE: "/Grados/EliminarGrado",

  // Secciones
  CREATE_SECTION: "/Secciones/CrearSeccion",
  UPDATE_SECTION: "/Secciones/ActualizarSeccion",
  GET_SECTIONS: "/Secciones/ConsultarSecciones",
  DELETE_SECTION: "/Secciones/EliminarSeccion",

  // Asignaciones
  CREATE_ASSIGNMENT: "/Asignacion/Registrar",

  // Calificaciones
  FILTER_GRADES: "/Calificaciones/FiltroCalificaciones",
  GRADE_TASK: "/Calificaciones/CalificarTarea",

  // Reportes
  GRADE_SECTION_REPORT: "/Reportes/GradoSeccion",
  GRADE_SECTION_COURSE_REPORT: "/Reportes/GradoSeccionCurso",
  TEACHER_ASSIGNMENT_REPORT: "/Reportes/ProfeXGradoCursoSeccion",
};

export default API_BASE_URL;
