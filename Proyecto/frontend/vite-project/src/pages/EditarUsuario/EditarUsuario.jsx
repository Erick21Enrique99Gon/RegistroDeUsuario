import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    obtenerUsuario,
    listarPasaportesUsuario,
    habilitarPasaporteUsuario
} from '../../services/AdministracionServices';
import { useNavigate } from 'react-router-dom';
import "../Login/Login.css";     // para input-field, submit-btn, etc.
import "./EditarUsuario.css";
function DetalleUsuarioConPasaportes() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [pasaportes, setPasaportes] = useState([]);
    const [error, setError] = useState(null);
    const [loadingBtn, setLoadingBtn] = useState(null); // numero_de_pasaporte+lugar

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setError(null);
                const [userData, pasaportesData] = await Promise.all([
                    obtenerUsuario(id),
                    listarPasaportesUsuario(id)
                ]);
                setUsuario(userData);
                setPasaportes(Array.isArray(pasaportesData) ? pasaportesData : []);
            } catch (err) {
                console.error(err);
                setError('Error al cargar la información');
            }
        };
        if (id) cargarDatos();
    }, [id]);

    const handleHabilitarPasaporte = async (pasaporte) => {
        const key = pasaporte.numero_de_pasaporte + pasaporte.lugar;
        if (loadingBtn === key) return;

        try {
            setLoadingBtn(key);
            setError(null);

            await habilitarPasaporteUsuario(
                id,
                pasaporte.numero_de_pasaporte,
                pasaporte.lugar
            );

            // Recargar los pasaportes desde el servidor
            const pasaportesActualizados = await listarPasaportesUsuario(id);
            setPasaportes(Array.isArray(pasaportesActualizados) ? pasaportesActualizados : []);
        } catch (err) {
            console.error(err);
            setError('Error al habilitar el pasaporte');
        } finally {
            setLoadingBtn(null);
        }
    };

    const irADetalle = (idUsuario, numeroPasaporte, lugar) => {
        // Construye la URL: /obtenerPasaporte/:usuarioId/:pasaporte/:lugar
        navigate(`/obtenerPasaporte/${idUsuario}/${numeroPasaporte}/${lugar}`);
    };
    if (!usuario) return <p>Cargando...</p>;

return (
  <div className="modified-page">
    <div className="modified-card">
      {/* Encabezado */}
      <div className="modified-header">
        <div>
          <h2 className="modified-title">Detalle de usuario</h2>
          <p className="modified-subtitle">
            Información del ciudadano y sus pasaportes
          </p>
        </div>
      </div>

      {error && <div className="error-message modified-full">{error}</div>}

      {/* Datos básicos del usuario */}
      <div className="modified-form">
        <div className="input-group">
          <label className="input-label">Correo electrónico</label>
          <input
            type="text"
            className="input-field edit-user-id"
            value={usuario.correo_electronico}
            disabled
          />
        </div>

        <div className="input-group">
          <label className="input-label">Teléfono</label>
          <input
            type="text"
            className="input-field edit-user-id"
            value={usuario.telefono}
            disabled
          />
        </div>

        <div className="input-group modified-full">
          <label className="input-label">Nombres</label>
          <input
            type="text"
            className="input-field edit-user-id"
            value={usuario.nombres}
            disabled
          />
        </div>

        {/* Botón registrar pasaporte */}
        <div className="modified-actions modified-full">
          <button
            type="button"
            className="submit-btn"
            onClick={() => navigate(`/registrar-pasaporte/${id}`)}
          >
            + Registrar nuevo pasaporte
          </button>
        </div>
      </div>

      {/* Mis pasaportes */}
      <h3 className="modified-section-title" style={{ marginTop: "1.5rem" }}>
        Mis pasaportes
      </h3>

      {pasaportes.length === 0 ? (
        <p className="modified-summary">
          No tienes pasaportes registrados.
        </p>
      ) : (
        <div className="passport-list">
          {pasaportes.map((pasaporte, index) => {
            const key =
              pasaporte.numero_de_pasaporte + pasaporte.lugar || index;
            const isLoading = loadingBtn === key;
            const activo = !!pasaporte.habilitado;

            return (
              <div key={key} className="passport-item">
                <div className="passport-item-header">
                  <span className="passport-number">
                    Pasaporte #{pasaporte.numero_de_pasaporte}
                  </span>
                  <span
                    className={
                      activo
                        ? "passport-flag passport-flag-on"
                        : "passport-flag passport-flag-off"
                    }
                  >
                    {activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="passport-item-body">
                  <div className="passport-row">
                    <span className="passport-label">Tipo</span>
                    <span className="passport-value">
                      {pasaporte.tipo_de_pasaporte}
                    </span>
                  </div>

                  <div className="passport-row">
                    <span className="passport-label">Fecha emisión</span>
                    <span className="passport-value">
                      {new Date(
                        pasaporte.fecha_de_emision
                      ).toLocaleDateString("es-EC")}
                    </span>
                  </div>

                  <div className="passport-row">
                    <span className="passport-label">Fecha vencimiento</span>
                    <span className="passport-value">
                      {new Date(
                        pasaporte.fecha_de_vencimiento
                      ).toLocaleDateString("es-EC")}
                    </span>
                  </div>

                  <div className="passport-row">
                    <span className="passport-label">Lugar</span>
                    <span className="passport-value">
                      {pasaporte.lugar}
                    </span>
                  </div>
                </div>

                <div className="modified-actions">
                  {!activo && (
                    <button
                      type="button"
                      className="submit-btn"
                      onClick={() => handleHabilitarPasaporte(pasaporte)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Habilitando..." : "Habilitar"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="modified-btn-secondary"
                    onClick={() =>
                      irADetalle(
                        pasaporte.id_usuario,
                        pasaporte.numero_de_pasaporte,
                        pasaporte.lugar
                      )
                    }
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

}

export default DetalleUsuarioConPasaportes;
