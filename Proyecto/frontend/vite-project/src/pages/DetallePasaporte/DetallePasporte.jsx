import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerPasaporte, habilitarPasaporteUsuario, listarPasaportesUsuario } from "../../services/AdministracionServices";
import { useNavigate } from 'react-router-dom';
import './DetallePasaporte.css'
function DetallePasaporte() {
  const { usuarioId, pasaporte, lugar } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cargarPasaporte = async () => {
    try {
      const resp = await obtenerPasaporte(usuarioId, pasaporte, lugar);
      const p = Array.isArray(resp) ? resp[0] : resp;
      setData(p);
    } catch (err) {
      console.error("Error al obtener pasaporte", err);
      setError("No se pudo obtener el pasaporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPasaporte();
  }, [usuarioId, pasaporte, lugar]);

  const handleHabilitarPasaporte = async () => {
    if (!data) return;

    const key = data.numero_de_pasaporte + data.lugar;
    if (loadingBtn === key) return;

    try {
      setLoadingBtn(key);
      setError(null);

      await habilitarPasaporteUsuario(
        usuarioId,
        data.numero_de_pasaporte,
        data.lugar
      );

      // Opcional: recargar desde el servidor para ver el nuevo estado
      const pasaportesActualizados = await listarPasaportesUsuario(usuarioId);
      const actualizado = Array.isArray(pasaportesActualizados)
        ? pasaportesActualizados.find(
            (p) =>
              p.numero_de_pasaporte === data.numero_de_pasaporte &&
              p.lugar === data.lugar
          )
        : null;

      if (actualizado) {
        setData(actualizado);
      } else {
        // Si no se encuentra, al menos marca habilitado en el estado local
        setData((prev) => ({ ...prev, habilitado: 1 }));
      }
    } catch (err) {
      console.error(err);
      setError("Error al habilitar el pasaporte");
    } finally {
      setLoadingBtn(null);
    }
  };

const handleUsuario = () => {
    // Aquí puedes pasar solo el id en la URL
    navigate(`/editarUsuario/${usuarioId}`);
    // o si quieres pasar todo el objeto:
    // navigate('/editarUsuario', { state: { usuarioId: idUsuario } });
  };
  if (loading) return <div>Cargando detalle de pasaporte...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return <div>No se encontró información del pasaporte.</div>;

return (
  <div className="passport-detail-page">
    <div className="passport-detail-card">
      {/* Encabezado */}
      <div className="passport-detail-header">
        <div>
          <h2 className="passport-detail-title">Detalle de pasaporte</h2>
          <p className="passport-detail-subtitle">
            Información completa del documento y su estado actual
          </p>
        </div>

        <span
          className={`passport-detail-status ${
            data.habilitado ? "passport-detail-status-on" : "passport-detail-status-off"
          }`}
        >
          {data.habilitado ? "Habilitado" : "Deshabilitado"}
        </span>
      </div>

      {/* Cuerpo: dos columnas de datos */}
      <div className="passport-detail-body">
        <div className="passport-detail-item">
          <span className="passport-detail-label">ID usuario</span>
          <span className="passport-detail-value">{data.id_usuario}</span>
        </div>

        <div className="passport-detail-item">
          <span className="passport-detail-label">Número de pasaporte</span>
          <span className="passport-detail-value">{data.numero_de_pasaporte}</span>
        </div>

        <div className="passport-detail-item">
          <span className="passport-detail-label">Tipo de pasaporte</span>
          <span className="passport-detail-value">{data.tipo_de_pasaporte}</span>
        </div>

        <div className="passport-detail-item">
          <span className="passport-detail-label">País de emisión</span>
          <span className="passport-detail-value">{data.pais_de_emision}</span>
        </div>

        <div className="passport-detail-item">
          <span className="passport-detail-label">Fecha de emisión</span>
          <span className="passport-detail-value">{data.fecha_de_emision}</span>
        </div>

        <div className="passport-detail-item">
          <span className="passport-detail-label">Fecha de vencimiento</span>
          <span className="passport-detail-value">{data.fecha_de_vencimiento}</span>
        </div>

        <div className="passport-detail-item passport-detail-full">
          <span className="passport-detail-label">Lugar de emisión</span>
          <span className="passport-detail-value">{data.lugar}</span>
        </div>

        {/* Si tienes más campos en data, puedes seguir el mismo patrón */}
      </div>

      {/* Acciones */}
      <div className="passport-detail-actions">
        <button
          className="passport-detail-btn-secondary"
          type="button"
          onClick={handleUsuario}
        >
          Usuario
        </button>

        <button
          type="button"
          className="submit-btn"
          onClick={handleHabilitarPasaporte}
          disabled={!!loadingBtn}
        >
          {loadingBtn ? "Habilitando..." : "Habilitar pasaporte"}
        </button>
      </div>
    </div>
  </div>
);

}

export default DetallePasaporte;
