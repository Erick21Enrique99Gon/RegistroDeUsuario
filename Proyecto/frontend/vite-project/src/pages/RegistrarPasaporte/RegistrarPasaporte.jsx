import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registraPasporte } from '../../services/AdministracionServices'; // Ajusta la ruta según tu estructura
import "../Login/Login.css";      // para input-field, submit-btn, etc.
import "./RegistrarPasaporte.css";
const RegistrarPasaporte = () => {
  const { id } = useParams(); // ID del usuario
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id_usuario: id,
    tipo_de_pasaporte: '',
    fecha_de_emision: '',
    fecha_de_vencimiento: '',
    lugar: '',
    pais_de_emision: '',
    numero_de_pasaporte: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar mensajes
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await registraPasporte(formData);
      setSuccess('Pasaporte registrado exitosamente');
      
      // Redirigir al detalle del usuario después de 1.5 segundos
      setTimeout(() => {
        navigate(`/detalle-usuario/${id}`); // Ajusta la ruta según tu app
      }, 1500);
      
    } catch (err) {
      console.error('Error al registrar pasaporte:', err);
      setError(err.message || 'Error al registrar pasaporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-passport-page">
      <div className="register-passport-card">
        <div className="register-passport-header">
          <div>
            <h2 className="register-passport-title">Registrar pasaporte</h2>
            <p className="register-passport-subtitle">
              Completa los datos del documento para el usuario
            </p>
          </div>
          <span className="register-passport-badge">Usuario {id}</span>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="register-passport-form">
          <div className="input-group register-passport-full">
            <label className="input-label">
              Número de pasaporte
            </label>
            <input
              type="text"
              name="numero_de_pasaporte"
              className="input-field"
              value={formData.numero_de_pasaporte}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Tipo de pasaporte
            </label>
            <select
              name="tipo_de_pasaporte"
              className="input-field"
              value={formData.tipo_de_pasaporte}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Seleccionar tipo</option>
              <option value="ORD">Ordinario</option>
              <option value="DIP">Diplomático</option>
              <option value="EMB">Emergencia</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">
              Fecha de emisión
            </label>
            <input
              type="date"
              name="fecha_de_emision"
              className="input-field"
              value={formData.fecha_de_emision}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              name="fecha_de_vencimiento"
              className="input-field"
              value={formData.fecha_de_vencimiento}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Lugar de emisión
            </label>
            <input
              type="text"
              name="lugar"
              className="input-field"
              value={formData.lugar}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              País de emisión
            </label>
            <input
              type="text"
              name="pais_de_emision"
              className="input-field"
              value={formData.pais_de_emision}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="register-passport-actions">
            <button
              type="button"
              className="register-passport-btn-secondary"
              onClick={() => navigate(`/editarUsuario/${id}`)}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar pasaporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default RegistrarPasaporte;
