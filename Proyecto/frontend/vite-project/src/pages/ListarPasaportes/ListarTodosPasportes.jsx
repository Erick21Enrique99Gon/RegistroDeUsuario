import { useEffect, useState } from "react";

import { listarPasaportes } from "../../services/AdministracionServices";
import { useNavigate } from 'react-router-dom';
import "./ListarTodosPasaportes.css";

const ListarTodosPasaportes = () => {
  const [pasaportes, setPasaportes] = useState([]);
  const navigate = useNavigate();
  const [filtroNumero, setFiltroNumero] = useState("");
  const [filtroPais, setFiltroPais] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const pasaportesFiltrados = pasaportes.filter((p) => {
    const coincideNumero =
      !filtroNumero ||
      (p.numero_de_pasaporte || "")
        .toLowerCase()
        .includes(filtroNumero.toLowerCase());

    const coincidePais =
      !filtroPais ||
      (p.pais_nombre || "")
        .toLowerCase()
        .includes(filtroPais.toLowerCase());

    const habilitadoBool = p.habilitado === 1 || p.habilitado === true;
    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "habilitado" && habilitadoBool) ||
      (filtroEstado === "deshabilitado" && !habilitadoBool);

    return coincideNumero && coincidePais && coincideEstado;
  });

  useEffect(() => {
    const obtenerPasaportes = async () => {
      try {
        const respuesta = await listarPasaportes()

        setPasaportes(respuesta);
      } catch (error) {
        console.error("Error al listar pasaportes", error);
      }
    };

    obtenerPasaportes();
  }, []);

  const irADetalle = (idUsuario, numeroPasaporte, lugar) => {
    // Construye la URL: /obtenerPasaporte/:usuarioId/:pasaporte/:lugar
    navigate(`/obtenerPasaporte/${idUsuario}/${numeroPasaporte}/${lugar}`);
  };

  return (
  <div className="all-passports-page">
    <div className="all-passports-card">
      <div className="all-passports-header">
        <div>
          <h2 className="all-passports-title">Todos los pasaportes</h2>
          <p className="all-passports-subtitle">
            Administración general de pasaportes emitidos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="all-passports-filters">
        <div className="filter-group">
          <label className="filter-label">Número</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por número"
            value={filtroNumero}
            onChange={(e) => setFiltroNumero(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">País</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por país"
            value={filtroPais}
            onChange={(e) => setFiltroPais(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Estado</label>
          <select
            className="filter-input"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="habilitado">Habilitado</option>
            <option value="deshabilitado">Deshabilitado</option>
          </select>
        </div>
      </div>

      {/* Lista / tabla */}
      <div className="all-passports-table-wrapper">
        <table className="all-passports-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Usuario</th>
              <th>País</th>
              <th>Emisión</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pasaportesFiltrados.map((p) => {
              const habilitadoBool = p.habilitado === 1 || p.habilitado === true;
              return (
                <tr key={p.id_usuario+p.numero_de_pasaporte+p.lugar}>
                  <td>{p.numero_de_pasaporte}</td>
                  <td>{p.id_usuario}</td>
                  <td>{p.pais_nombre}</td>
                  <td>{p.fecha_emision}</td>
                  <td>{p.fecha_vencimiento}</td>
                  <td>
                    <span
                      className={
                        habilitadoBool
                          ? "passport-flag passport-flag-on"
                          : "passport-flag passport-flag-off"
                      }
                    >
                      {habilitadoBool ? "Habilitado" : "Deshabilitado"}
                    </span>
                  </td>
                  <td>
                    {/* aquí mantienes tus botones / enlaces de detalle */}
                    {/* por ejemplo: */}
                    <button
                      className="table-action"
                      onClick={() => irADetalle(p.id_usuario,p.numero_de_pasaporte,p.lugar)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}

            {pasaportesFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="all-passports-empty">
                  No se encontraron pasaportes con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

};

export default ListarTodosPasaportes;
