import { useEffect, useState } from 'react';
import { listarUsuarios } from '../../services/AdministracionServices';
import { useNavigate } from 'react-router-dom';

function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <-- crear navigate aquí

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
    <table>
      <thead>
        <tr>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Nombres</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id}>
            <td>{u.correo_electronico}</td>
            <td>{u.telefono}</td>
            <td>{u.nombres}</td>
            <td>
              <button onClick={() => handleSeleccionarUsuario(u.id)}>
                Ver / Editar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ListarUsuarios;
