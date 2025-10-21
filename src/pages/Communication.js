import React, { useState } from "react";
import "./Communication.css";
import { useAuth } from "../context/AuthContext";

const Communication = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  // Estado para anuncios persistentes
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem("school_announcements");
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    asunto: "",
    mensaje: "",
    destinatarios: "todos",
    grado: "",
    seccion: "",
    urgencia: "normal",
    programarEnvio: false,
    fechaEnvio: "",
  });

  const canSend = user?.rolID === 1 || user?.rolID === 2 || user?.rolID === 5; // Admin, Profesor o Coordinador
  const isStudent = user?.rolID === 3;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Función para guardar anuncios en localStorage
  const saveAnnouncement = (announcement) => {
    const newAnnouncements = [announcement, ...announcements];
    setAnnouncements(newAnnouncements);
    localStorage.setItem(
      "school_announcements",
      JSON.stringify(newAnnouncements)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;

    const newMessage = {
      id: messages.length + 1,
      ...formData,
      fechaCreacion: new Date().toLocaleString(),
      estado: formData.programarEnvio ? "Programado" : "Enviado",
      enviados: calcularDestinatarios(formData),
      remitente: user.primerNombre + " " + user.primerApellido,
    };

    setMessages([newMessage, ...messages]);

    // Si es de alta urgencia, guardar automáticamente como anuncio
    if (formData.urgencia === "alta") {
      saveAnnouncement({
        ...newMessage,
        id: Date.now(), // ID único para anuncios
        tipo: "anuncio",
      });
    }

    setFormData({
      asunto: "",
      mensaje: "",
      destinatarios: "todos",
      grado: "",
      seccion: "",
      urgencia: "normal",
      programarEnvio: false,
      fechaEnvio: "",
    });

    alert("Mensaje enviado exitosamente");
  };

  const calcularDestinatarios = (data) => {
    switch (data.destinatarios) {
      case "todos":
        return "Todos los estudiantes";
      case "grado":
        return `Grado ${data.grado}`;
      case "seccion":
        return `Sección ${data.seccion}`;
      default:
        return "Todos los estudiantes";
    }
  };

  const getUrgenciaClass = (urgencia) => {
    switch (urgencia) {
      case "alta":
        return "urgencia-alta";
      case "media":
        return "urgencia-media";
      default:
        return "urgencia-normal";
    }
  };

  // Función para eliminar anuncio
  const handleDeleteAnnouncement = (announcementId) => {
    if (!window.confirm("¿Estás seguro de eliminar este anuncio?")) return;

    const updatedAnnouncements = announcements.filter(
      (a) => a.id !== announcementId
    );
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem(
      "school_announcements",
      JSON.stringify(updatedAnnouncements)
    );
    alert("Anuncio eliminado exitosamente");
  };

  // Función para eliminar mensaje del historial
  const handleDeleteMessage = (messageId) => {
    if (!window.confirm("¿Estás seguro de eliminar este comunicado?")) return;

    const updatedMessages = messages.filter((m) => m.id !== messageId);
    setMessages(updatedMessages);
    alert("Comunicado eliminado exitosamente");
  };

  // Función para convertir mensaje en anuncio
  const handlePromoteToAnnouncement = (message) => {
    const newAnnouncement = {
      ...message,
      id: Date.now(), // Nuevo ID único
      tipo: "anuncio",
    };

    saveAnnouncement(newAnnouncement);
    alert("Mensaje convertido en anuncio permanente");
  };

  // Función para reenviar mensaje
  const handleResendMessage = (message) => {
    setFormData({
      asunto: message.asunto,
      mensaje: message.mensaje,
      destinatarios: message.destinatarios,
      grado: message.grado,
      seccion: message.seccion,
      urgencia: message.urgencia,
      programarEnvio: false,
      fechaEnvio: "",
    });

    // Scroll al formulario
    document
      .querySelector(".communication-form")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="communication-container">
      <h1>Comunicación Institucional</h1>

      {/* Solo admin, profesor y coordinador pueden enviar mensajes */}
      {canSend ? (
        <div className="communication-form">
          <h2>Enviar Comunicado Interno</h2>
          <div className="form-info">
            <p>
              <strong>Nota:</strong> Estos comunicados se almacenan localmente
              en el navegador.
            </p>
            <p>
              Para enviar avisos masivos por correo a todos los usuarios, use la
              opción <strong>"Avisos Masivos"</strong> en el menú.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Asunto:</label>
                <input
                  type="text"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleInputChange}
                  placeholder="Asunto del comunicado..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Nivel de Urgencia:</label>
                <select
                  name="urgencia"
                  value={formData.urgencia}
                  onChange={handleInputChange}
                >
                  <option value="normal">Normal</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta (Se convierte en anuncio)</option>
                </select>
              </div>
            </div>
            {/*
            <div className="form-group">
              <label>Destinatarios:</label>
              <div className="destinatarios-options">
                <label>
                  <input
                    type="radio"
                    name="destinatarios"
                    value="todos"
                    checked={formData.destinatarios === "todos"}
                    onChange={handleInputChange}
                  />
                  Todos los estudiantes
                </label>
                <label>
                  <input
                    type="radio"
                    name="destinatarios"
                    value="grado"
                    checked={formData.destinatarios === "grado"}
                    onChange={handleInputChange}
                  />
                  Por grado
                </label>
                <label>
                  <input
                    type="radio"
                    name="destinatarios"
                    value="seccion"
                    checked={formData.destinatarios === "seccion"}
                    onChange={handleInputChange}
                  />
                  Por sección
                </label>
              </div>
            </div>

            {formData.destinatarios === "grado" && (
              <div className="form-group">
                <label>Grado:</label>
                <select
                  name="grado"
                  value={formData.grado}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar grado</option>
                  <option value="1ro">1ro Primaria</option>
                  <option value="2do">2do Primaria</option>
                  <option value="3ro">3ro Primaria</option>
                  <option value="4to">4to Primaria</option>
                  <option value="5to">5to Primaria</option>
                  <option value="6to">6to Primaria</option>
                </select>
              </div>
            )}

            {formData.destinatarios === "seccion" && (
              <div className="form-group">
                <label>Sección:</label>
                <select
                  name="seccion"
                  value={formData.seccion}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar sección</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            )}
*/}
            <div className="form-group">
              <label>Mensaje:</label>
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleInputChange}
                rows="6"
                placeholder="Escribe el mensaje aquí..."
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="programarEnvio"
                  checked={formData.programarEnvio}
                  onChange={handleInputChange}
                />
                Programar envío para fecha futura
              </label>
            </div>

            {formData.programarEnvio && (
              <div className="form-group">
                <label>Fecha y hora de envío:</label>
                <input
                  type="datetime-local"
                  name="fechaEnvio"
                  value={formData.fechaEnvio}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <button type="submit" className="btn-primary">
              {formData.programarEnvio ? "Programar Envío" : "Enviar Ahora"}
            </button>
          </form>
        </div>
      ) : (
        <div className="info-message">
          <h3>Solo lectura</h3>
          <p>Como estudiante, puedes ver los comunicados pero no enviarlos.</p>
        </div>
      )}

      <div className="communication-sections">
        {/* Sección de Anuncios Activos (Persistentes) */}
        <div className="announcements-section">
          <h2>📢 Anuncios Activos ({announcements.length})</h2>
          {announcements.length === 0 ? (
            <p className="no-data">
              {isStudent
                ? "No hay anuncios activos"
                : "No hay anuncios publicados"}
            </p>
          ) : (
            <div className="messages-list">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`message-card ${getUrgenciaClass(
                    announcement.urgencia
                  )} announcement-card`}
                >
                  <div className="message-header">
                    <h3>{announcement.asunto}</h3>
                    <div className="message-meta">
                      <span
                        className={`urgency-badge ${getUrgenciaClass(
                          announcement.urgencia
                        )}`}
                      >
                        {announcement.urgencia}
                      </span>
                      <span className="announcement-badge">Anuncio</span>
                    </div>
                  </div>
                  <div className="message-details">
                    <p>
                      <strong>De:</strong>{" "}
                      {announcement.remitente || "Administración"}
                    </p>
                    <p>
                      <strong>Para:</strong> {announcement.enviados}
                    </p>
                    <p>
                      <strong>Publicado:</strong> {announcement.fechaCreacion}
                    </p>
                  </div>
                  <div className="message-content">
                    <p>{announcement.mensaje}</p>
                  </div>
                  {canSend && (
                    <div className="message-actions">
                      <button
                        className="btn-delete"
                        onClick={() =>
                          handleDeleteAnnouncement(announcement.id)
                        }
                      >
                        Eliminar Anuncio
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Historial de Comunicados (Temporal) */}
        <div className="communication-history">
          <h2>
            {isStudent
              ? "💬 Comunicados Recientes"
              : "📋 Historial de Comunicados"}{" "}
            ({messages.length})
          </h2>
          {messages.length === 0 ? (
            <p className="no-data">
              {isStudent
                ? "No has recibido comunicados recientes"
                : "No hay comunicados enviados"}
            </p>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-card ${getUrgenciaClass(
                    message.urgencia
                  )}`}
                >
                  <div className="message-header">
                    <h3>{message.asunto}</h3>
                    <div className="message-meta">
                      <span
                        className={`urgency-badge ${getUrgenciaClass(
                          message.urgencia
                        )}`}
                      >
                        {message.urgencia}
                      </span>
                      <span
                        className={`status-badge ${message.estado.toLowerCase()}`}
                      >
                        {message.estado}
                      </span>
                    </div>
                  </div>
                  <div className="message-details">
                    <p>
                      <strong>De:</strong> {message.remitente || "Sistema"}
                    </p>
                    <p>
                      <strong>Para:</strong> {message.enviados}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {message.fechaCreacion}
                    </p>
                  </div>
                  <div className="message-content">
                    <p>{message.mensaje}</p>
                  </div>
                  {canSend && (
                    <div className="message-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleResendMessage(message)}
                      >
                        Reenviar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        Eliminar
                      </button>
                      <button
                        className="btn-promote"
                        onClick={() => handlePromoteToAnnouncement(message)}
                      >
                        Convertir en Anuncio
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communication;
