import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registraPasporte } from '../../services/AdministracionServices'; // Ajusta la ruta según tu estructura

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
    <div className="login-container">
      <div className="login-content">
        <h2 className="text-center">Registrar Pasaporte</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {success && (
          <div className="success-message">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="login-box">
          <div className="input-group">
            <label><strong>Número de Pasaporte</strong></label>
            <input
              type="text"
              name="numero_de_pasaporte"
              value={formData.numero_de_pasaporte}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label><strong>Tipo de Pasaporte</strong></label>
            <select
              name="tipo_de_pasaporte"
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
            <label><strong>Fecha de Emisión</strong></label>
            <input
              type="date"
              name="fecha_de_emision"
              value={formData.fecha_de_emision}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label><strong>Fecha de Vencimiento</strong></label>
            <input
              type="date"
              name="fecha_de_vencimiento"
              value={formData.fecha_de_vencimiento}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label><strong>Lugar de Emisión</strong></label>
            <input
              type="text"
              name="lugar"
              value={formData.lugar}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label><strong>País de Emisión</strong></label>
            <input
              type="text"
              name="pais_de_emision"
              value={formData.pais_de_emision}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="text-center" style={{ marginTop: '20px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Pasaporte'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/editarUsuario/${id}`)}
              disabled={loading}
              style={{ marginLeft: '10px' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarPasaporte;
