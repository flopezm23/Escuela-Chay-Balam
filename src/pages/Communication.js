import React, { useState } from "react";
import "./Communication.css";
import { useAuth } from "../context/AuthContext";

const Communication = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
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

  const canSend = user?.role === "admin" || user?.role === "docente";

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
      remitente: user.nombre,
    };
    setMessages([newMessage, ...messages]);

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

  return (
    <div className="communication-container">
      <h1>Comunicación Institucional</h1>

      {/* Solo admin y docente pueden enviar mensajes */}
      {canSend ? (
        <div className="communication-form">
          <h2>Enviar Comunicado</h2>
          <form onSubmit={handleSubmit}>
            {/* ... (todo el formulario de comunicación permanece igual) ... */}
          </form>
        </div>
      ) : (
        <div className="info-message">
          <h3>Solo lectura</h3>
          <p>Como estudiante, puedes ver los comunicados pero no enviarlos.</p>
        </div>
      )}

      <div className="communication-history">
        <h2>
          {user?.role === "estudiante"
            ? "Comunicados Recibidos"
            : "Historial de Comunicados"}{" "}
          ({messages.length})
        </h2>
        {messages.length === 0 ? (
          <p className="no-data">
            {user?.role === "estudiante"
              ? "No has recibido comunicados"
              : "No hay comunicados enviados"}
          </p>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-card ${getUrgenciaClass(message.urgencia)}`}
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
                    <button className="btn-edit">Reenviar</button>
                    <button className="btn-delete">Eliminar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
