import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modificarUsuario, listarPaises, contraseniaUsuario,autenticarUsuario } from '../../services/AdministracionServices';
import { getCookie, setCookie } from '../../utils/cookies';
import './Modifiad.css'

export default function ModificarUsuario() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    correo_electronico: '',
    telefono: '',
    nombres: '',
    apellidos: '',
    sexo: '',
    genero: '',
    pais: 1,
    administrador: false,
    ciudadano: true,
    habilitado: true,
    id: '',
    contrasenia: '' // Campo nuevo para contraseña
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paises, setPaises] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [contraseniaActual, setContraseniaActual] = useState('');

  // Cargar países
  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const resp = await listarPaises();
        setPaises(resp);
      } catch (error) {
        console.error('Error al cargar países:', error);
      }
    };
    fetchPaises();
  }, []);

  // Cargar datos del usuario desde cookie "usuario"
    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                // Obtener usuario desde cookie 'usuario' (igual que en login)
                const usuarioCookie = getCookie('usuario');
                const usuarioAutenticado = getCookie('autenticacion');
                
                if (!usuarioCookie) {
                setError('No se encontró información del usuario');
                setLoadingUser(false);
                return;
                }

                // Verificar que el ID coincida con la ruta
                if (!usuarioAutenticado) {
                setError('Usuario no autorizado para esta acción...');
                setLoadingUser(false);
                return;
                }
                
                setFormData({
                    id: usuarioCookie.id,
                    correo_electronico: usuarioCookie.correo_electronico || '',
                    telefono: usuarioCookie.telefono || '',
                    nombres: usuarioCookie.nombres || '',
                    apellidos: usuarioCookie.apellidos || '',
                    sexo: usuarioCookie.sexo || '',
                    genero: usuarioCookie.genero || '',
                    pais: usuarioCookie.pais || 1,
                    administrador: usuarioCookie.administrador || false,
                    ciudadano: usuarioCookie.ciudadano || false,
                    habilitado: usuarioCookie.habilitado || false
                });
            } catch (error) {
                console.error('Error al cargar usuario desde cookie', error);
                setError('Error al cargar datos del usuario');
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUsuario();
    }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleContraseniaActualChange = (e) => {
    setContraseniaActual(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificar que tenemos ID antes de enviar
      if (!formData.id) {
        setError('ID de usuario requerido');
        setLoading(false);
        return;
      }

      if (formData.contrasenia) {


        const resp = await autenticarUsuario(formData.id, contraseniaActual);
        if (!resp.autenticacion) {
          setError('Contrasenia Incorrecta');
          setLoadingUser(false);
          return;
        }

        await contraseniaUsuario(formData.id, formData.contrasenia);
        
        alert('Contraseña actualizada exitosamente'); 
      }

      // Enviar actualización al backend (sin token, si el backend usa cookies)
      const response = await modificarUsuario(formData);
      console.log('Usuario actualizado:', response);

      // Opcional: Actualizar cookie local con nuevos datos
      setCookie('usuario', { ...getCookie('usuario'), ...formData });

      alert('Usuario actualizado exitosamente');
      
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="modified-container">
        <div className="modified-content">
          <h2 className="text-center">Cargando usuario...</h2>
        </div>
      </div>
    );
  }

  return (
<div className="modified-page">
  <div className="modified-card">
    {/* Encabezado superior */}
    <div className="modified-header">
      <div>
        <h2 className="modified-title">Mi perfil</h2>
        <p className="modified-subtitle">
          Actualiza tus datos personales y de contacto
        </p>
      </div>
      <span className="modified-status-badge">Ciudadano activo</span>
    </div>

    {/* ID solo lectura */}
    <div className="input-group modified-full">
      <label className="input-label">ID Usuario</label>
      <input
        type="text"
        value={formData.id}
        readOnly
        className="input-field input-readonly"
        disabled
      />
    </div>

    {/* Formulario en grid */}
    <form onSubmit={handleSubmit} className="modified-form">
      <div className="input-group">
        <label htmlFor="nombres" className="input-label">Nombres</label>
        <input
          type="text"
          id="nombres"
          name="nombres"
          value={formData.nombres}
          onChange={handleInputChange}
          required
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="apellidos" className="input-label">Apellidos</label>
        <input
          type="text"
          id="apellidos"
          name="apellidos"
          value={formData.apellidos}
          onChange={handleInputChange}
          required
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="correo_electronico" className="input-label">
          Correo Electrónico
        </label>
        <input
          type="email"
          id="correo_electronico"
          name="correo_electronico"
          value={formData.correo_electronico}
          onChange={handleInputChange}
          required
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="telefono" className="input-label">Teléfono</label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleInputChange}
          required
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="sexo" className="input-label">Sexo</label>
        <select
          id="sexo"
          name="sexo"
          value={formData.sexo}
          onChange={handleInputChange}
          required
          className="input-field"
        >
          <option value="">Seleccione...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="genero" className="input-label">Género</label>
        <select
          id="genero"
          name="genero"
          value={formData.genero}
          onChange={handleInputChange}
          required
          className="input-field"
        >
          <option value="">Seleccione...</option>
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div className="input-group modified-full">
        <label htmlFor="pais" className="input-label">País</label>
        <select
          id="pais"
          name="pais"
          value={formData.pais}
          onChange={handleInputChange}
          required
          className="input-field"
        >
          <option value="">Seleccione...</option>
          {paises.map((pais) => (
            <option key={pais.id} value={pais.id}>
              {pais.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Cambio de contraseña */}
      <div className="input-group modified-full">
        <label htmlFor="contraseniaActual" className="input-label">
          Contraseña actual (requerida para cambio)
        </label>
        <div className="password-wrapper">
          <input
            type={mostrarContrasenia ? "text" : "password"}
            id="contraseniaActual"
            name="contraseniaActual"
            value={contraseniaActual}
            onChange={handleContraseniaActualChange}
            placeholder="Ingrese contraseña actual"
            className="input-field"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
          >
            {mostrarContrasenia ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <div className="input-group modified-full">
        <label htmlFor="contrasenia" className="input-label">
          Nueva contraseña (opcional)
        </label>
        <input
          type={mostrarContrasenia ? "text" : "password"}
          id="contrasenia"
          name="contrasenia"
          value={formData.contrasenia}
          onChange={handleInputChange}
          placeholder="Deje vacío para no cambiar contraseña"
          className="input-field"
        />
      </div>

      {/* Checkboxes */}
      <div className="modified-checkbox-row">
        <label className="modified-checkbox-label">
          <input
            type="checkbox"
            name="administrador"
            checked={formData.administrador === true}
            onChange={handleCheckboxChange}
          />
          Administrador
        </label>
        <label className="modified-checkbox-label">
          <input
            type="checkbox"
            name="ciudadano"
            checked={formData.ciudadano === true}
            onChange={handleCheckboxChange}
          />
          Ciudadano
        </label>
        <label className="modified-checkbox-label">
          <input
            type="checkbox"
            name="habilitado"
            checked={formData.habilitado === true}
            onChange={handleCheckboxChange}
          />
          Habilitado
        </label>
      </div>

      {error && (
        <div className="error-message modified-full">{error}</div>
      )}

      <div className="modified-actions">
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar usuario"}
        </button>
      </div>
    </form>
  </div>
</div>

  );
}
