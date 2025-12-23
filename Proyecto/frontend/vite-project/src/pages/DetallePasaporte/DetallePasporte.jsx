import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerPasaporte, habilitarPasaporteUsuario, listarPasaportesUsuario } from "../../services/AdministracionServices";
import { useNavigate } from 'react-router-dom';

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
    <div className="container mt-4">
      <h2>Detalle de Pasaporte</h2>

      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>Id Usuario</th>
            <td>{data.id_usuario}</td>
          </tr>
          <tr>
            <th>Tipo de pasaporte</th>
            <td>{data.tipo_de_pasaporte}</td>
          </tr>
          <tr>
            <th>Fecha de emisión</th>
            <td>{data.fecha_de_emision}</td>
          </tr>
          <tr>
            <th>Fecha de vencimiento</th>
            <td>{data.fecha_de_vencimiento}</td>
          </tr>
          <tr>
            <th>Lugar</th>
            <td>{data.lugar}</td>
          </tr>
          <tr>
            <th>País de emisión</th>
            <td>{data.pais_de_emision}</td>
          </tr>
          <tr>
            <th>Número de pasaporte</th>
            <td>{data.numero_de_pasaporte}</td>
          </tr>
          <tr>
            <th>Habilitado</th>
            <td>{data.habilitado ? "Sí" : "No"}</td>
          </tr>
        </tbody>
      </table>

      <button
        className="btn btn-success"
        onClick={handleHabilitarPasaporte}
        disabled={!!loadingBtn}
      >
        {loadingBtn ? "Habilitando..." : "Habilitar pasaporte"}
      </button>
                    <button onClick={() => handleUsuario()}>
                Usuario
              </button>
    </div>
  );
}

export default DetallePasaporte;
