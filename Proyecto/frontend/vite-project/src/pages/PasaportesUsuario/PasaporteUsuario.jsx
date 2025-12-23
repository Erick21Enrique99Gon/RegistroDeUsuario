import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarPasaportesUsuario } from '../../services/AdministracionServices';
import { getCookie } from '../../utils/cookies';

import "./ListarPasaportes.css";
import "../Login/Login.css";
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
  <div className="passport-page">
    <div className="passport-card">
      <div className="passport-header">
        <div>
          <h2 className="passport-title">Mis pasaportes</h2>
          <p className="passport-subtitle">
            Consulta el historial de pasaportes asociados a tu usuario
          </p>
        </div>
      </div>

      {loading && <p className="passport-info">Cargando pasaportes...</p>}
      {error && <p className="passport-error">{error}</p>}

      {!loading && pasaportes.length === 0 && !error && (
        <div className="passport-empty">
          <p>No se encontraron pasaportes asociados.</p>
        </div>
      )}

      {!loading && pasaportes.length > 0 && (
        <div className="passport-list">
          {pasaportes.map((p) => (
            <div key={p.id+p.numero_de_pasaporte+p.lugar} className="passport-item"><div className="passport-item-header">
              <span className="passport-number">
                Pasaporte #{p.numero_de_pasaporte}
              </span>
              

              <span className={p.habilitado ? "passport-flag passport-flag-on" 
                                            : "passport-flag passport-flag-off"}>
                {p.habilitado ? "Habilitado" : "Deshabilitado"}
              </span>

            </div>

              <div className="passport-item-body">
                <div className="passport-row">
                  <span className="passport-label">Fecha emisión</span>
                  <span className="passport-value">{p.fecha_de_emision}</span>
                </div>
                <div className="passport-row">
                  <span className="passport-label">Fecha vencimiento</span>
                  <span className="passport-value">{p.fecha_de_vencimiento}</span>
                </div>
                <div className="passport-row">
                  <span className="passport-label">País</span>
                  <span className="passport-value">{p.pais_de_emision}</span>
                </div>
                <div className="passport-row">
                  <span className="passport-label">Lugar emisión</span>
                  <span className="passport-value">{p.lugar}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
}
