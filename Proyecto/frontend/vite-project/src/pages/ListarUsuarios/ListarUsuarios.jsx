import { useEffect, useState } from 'react';
import { listarUsuarios } from '../../services/AdministracionServices';
import { useNavigate } from 'react-router-dom';
import "./ListarUsuarios.css";

function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

const [filtroTexto, setFiltroTexto] = useState("");
const [filtroRol, setFiltroRol] = useState("todos");
const [filtroEstado, setFiltroEstado] = useState("todos");

const usuariosFiltrados = usuarios.filter((u) => {
  const texto = (filtroTexto || "").toLowerCase();

  const coincideTexto =
    !texto ||
    (u.nombres || "").toLowerCase().includes(texto) ||
    (u.apellidos || "").toLowerCase().includes(texto) ||
    (u.correo_electronico || "").toLowerCase().includes(texto) ||
    (u.id || "").toLowerCase().includes(texto);

  const esAdmin = !!u.administrador;
  const esCiudadano = !!u.ciudadano;

  const coincideRol =
    filtroRol === "todos" ||
    (filtroRol === 1 && esAdmin) ||
    (filtroRol === 1 && esCiudadano);

  const habilitadoBool = !!u.habilitado;
  const coincideEstado =
    filtroEstado === "todos" ||
    (filtroEstado === "habilitado" && habilitadoBool) ||
    (filtroEstado === "deshabilitado" && !habilitadoBool);

  return coincideTexto && coincideRol && coincideEstado;
});
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const resp = await listarUsuarios();
        setUsuarios(resp);
      } catch (error) {
        console.error('Error al cargar usuarios', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const handleSeleccionarUsuario = (idUsuario) => {
    // Aquí puedes pasar solo el id en la URL
    navigate(`/editarUsuario/${idUsuario}`);
    // o si quieres pasar todo el objeto:
    // navigate('/editarUsuario', { state: { usuarioId: idUsuario } });
  };

  if (loading) return <p>Cargando usuarios...</p>;

return (
  <div className="users-page">
    <div className="users-card">
      <div className="users-header">
        <div>
          <h2 className="users-title">Gestión de usuarios</h2>
          <p className="users-subtitle">
            Administra ciudadanos y administradores del sistema
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="users-filters">
        <div className="filter-group">
          <label className="filter-label">Buscar</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Nombre, correo o ID"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Rol</label>
          <select
            className="filter-input"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="admin">Administradores</option>
            <option value="ciudadano">Ciudadanos</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Estado</label>
          <select
            className="filter-input"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="habilitado">Habilitados</option>
            <option value="deshabilitado">Deshabilitados</option>
          </select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Sexo / Género</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => {
              const habilitadoBool = !!u.habilitado;
              const rolTexto = u.administrador
                ? "Administrador"
                : u.ciudadano
                ? "Ciudadano"
                : "Sin rol";

              return (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{`${u.nombres} ${u.apellidos}`}</td>
                  <td>{u.correo_electronico}</td>
                  <td>{u.telefono}</td>
                  <td>{`${u.sexo} / ${u.genero}`}</td>
                  <td>{rolTexto}</td>
                  <td>
                    <span
                      className={
                        habilitadoBool
                          ? "user-flag user-flag-on"
                          : "user-flag user-flag-off"
                      }
                    >
                      {habilitadoBool ? "Habilitado" : "Deshabilitado"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => handleSeleccionarUsuario(u.id)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}

            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={8} className="users-empty">
                  No se encontraron usuarios con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

}

export default ListarUsuarios;
