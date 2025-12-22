import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarPasaportesUsuario } from '../../services/AdministracionServices';
import { getCookie } from '../../utils/cookies';
import './ListarPasaportes.css';

export default function ListarPasaportes() {
  const navigate = useNavigate();
  const [pasaportes, setPasaportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPasaportes = async () => {
      try {
        const usuarioCookie = getCookie('usuario');
        if (!usuarioCookie || !usuarioCookie.id) {
          setError('No se encontró información del usuario');
          setLoading(false);
          return;
        }

        // Usar el servicio corregido
        const data = await listarPasaportesUsuario(usuarioCookie.id);
        setPasaportes(data);
      } catch (err) {
        console.error('Error al cargar pasaportes:', err);
        setError(err.message || 'Error al cargar pasaportes');
      } finally {
        setLoading(false);
      }
    };

    fetchPasaportes();
  }, []);

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-content">
          <h2 className="text-center">Cargando pasaportes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <h2 className="text-center">Mis Pasaportes</h2>
        <div className="login-box">
          {error && <div className="error-message">{error}</div>}
          
          {pasaportes.length === 0 ? (
            <p className="text-center">No tienes pasaportes registrados.</p>
          ) : (
            <div className="pasaportes-list">
              {pasaportes.map((pasaporte, index) => (
                <div key={pasaporte.numero_de_pasaporte+pasaporte.lugar || index} className="pasaporte-card">
                  <div className="input-group">
                    <label><strong>Número:</strong></label>
                    <span>{pasaporte.numero_de_pasaporte}</span>
                  </div>
                  <div className="input-group">
                    <label><strong>Tipo:</strong></label>
                    <span>{pasaporte.tipo_de_pasaporte}</span>
                  </div>
                  <div className="input-group">
                    <label><strong>Fecha Emisión:</strong></label>
                    <span>{new Date(pasaporte.fecha_de_emision).toLocaleDateString('es-EC')}</span>
                  </div>
                  <div className="input-group">
                    <label><strong>Fecha Vencimiento:</strong></label>
                    <span>{new Date(pasaporte.fecha_de_vencimiento).toLocaleDateString('es-EC')}</span>
                  </div>
                  <div className="input-group">
                    <label><strong>Lugar:</strong></label>
                    <span>{pasaporte.lugar}</span>
                  </div>
                  <div className="input-group">
                    <label><strong>País ID:</strong></label>
                    <span>{pasaporte.pais_de_emision}</span>
                  </div>
                  <div className="input-group">
                    <label><strong>Estado:</strong></label>
                    <span className={`status-${pasaporte.habilitado ? 'active' : 'inactive'}`}>
                      {pasaporte.habilitado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <a href="/usuarios" className="btn-link">← Volver a usuarios</a>
          </div>
        </div>
      </div>
    </div>
  );
}
