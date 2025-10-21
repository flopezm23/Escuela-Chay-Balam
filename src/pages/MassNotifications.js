import React, { useState } from "react";
import "./MassNotifications.css";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useApi } from "../hooks/useApi";

const MassNotifications = () => {
  const { user } = useAuth();
  const { loading, error, callApi, clearError } = useApi();
  const [formData, setFormData] = useState({
    Asunto: "",
    Mensaje: "",
  });

  const canSend = user?.rolID === 1 || user?.rolID === 5; // Solo Admin y Coordinador

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSend) return;

    try {
      await callApi(
        () => authService.sendMassNotification(formData),
        "Aviso masivo enviado exitosamente a todos los usuarios"
      );

      // Limpiar formulario
      setFormData({
        Asunto: "",
        Mensaje: "",
      });
    } catch (err) {
      console.error("Error enviando aviso masivo:", err);
    }
  };

  if (!canSend) {
    return (
      <div className="mass-notifications-container">
        <div className="unauthorized-message">
          <h1>Acceso No Autorizado</h1>
          <p>No tienes permisos para enviar avisos masivos.</p>
          <p>
            Solo los administradores y coordinadores pueden enviar avisos
            masivos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mass-notifications-container">
      <h1>Envío de Avisos Masivos</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="mass-notifications-form">
        <div className="form-info">
          <h3>⚠️ Información Importante</h3>
          <ul>
            <li>
              El aviso se enviará por <strong>correo electrónico</strong> a{" "}
              <strong>TODOS los usuarios</strong> del sistema
            </li>
            <li>
              Los destinatarios incluyen: Administradores, Profesores,
              Estudiantes, Coordinadores y Personal de Desarrollo
            </li>
            <li>
              Este envío es <strong>irreversible</strong> - verifique el
              contenido cuidadosamente
            </li>
            <li>
              El sistema enviará los correos automáticamente a través del
              servidor
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Asunto del Aviso *</label>
            <input
              type="text"
              name="Asunto"
              value={formData.Asunto}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Ingrese el asunto del aviso masivo..."
              maxLength="200"
            />
            <small>Máximo 200 caracteres</small>
          </div>

          <div className="form-group">
            <label>Mensaje *</label>
            <textarea
              name="Mensaje"
              value={formData.Mensaje}
              onChange={handleInputChange}
              rows="10"
              required
              disabled={loading}
              placeholder={`Escriba el mensaje que desea enviar a todos los usuarios...

Ejemplo:
Estimada comunidad educativa,

Les informamos que...

Atentamente,
Administración`}
              maxLength="2000"
            />
            <small>Máximo 2000 caracteres</small>
          </div>

          <div className="confirmation-section">
            <label className="checkbox-label">
              <input type="checkbox" required />
              Confirmo que he revisado el contenido y deseo enviar este aviso a
              todos los usuarios del sistema
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-warning" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Enviando Aviso Masivo...
                </>
              ) : (
                "📢 Enviar Aviso Masivo a Todos los Usuarios"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="usage-tips">
        <h3>💡 Recomendaciones para Avisos Masivos</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>Asuntos Claros</h4>
            <p>
              Use asuntos descriptivos que indiquen claramente el propósito del
              mensaje.
            </p>
          </div>
          <div className="tip-card">
            <h4>Contenido Conciso</h4>
            <p>Sea directo y vaya al punto principal del anuncio.</p>
          </div>
          <div className="tip-card">
            <h4>Formato Adecuado</h4>
            <p>Use párrafos cortos y listas para mejor legibilidad.</p>
          </div>
          <div className="tip-card">
            <h4>Revisión Previa</h4>
            <p>Siempre revise ortografía y contenido antes de enviar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MassNotifications;
