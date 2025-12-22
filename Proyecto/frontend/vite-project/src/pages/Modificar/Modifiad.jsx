import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modificarUsuario, listarPaises, contraseniaUsuario } from '../../services/AdministracionServices';
import { getCookie, setCookie } from '../../utils/cookies';

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

      console.log('Actualizando usuario:', formData);

      // CASO ESPECIAL: Si se proporciona nueva contraseña, verificar contraseña actual primero
      if (formData.contrasenia) {
        console.log('Actualizando contraseña...');
        await contraseniaUsuario(formData.id, formData.contrasenia);
        
        alert('Contraseña actualizada exitosamente');
        return; // Salir después de actualizar contraseña
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
      <div className="login-container">
        <div className="login-content">
          <h2 className="text-center">Cargando usuario...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <h2 className="text-center">Modificar Usuario</h2>
        <div className="login-box">
          {/* Mostrar ID del usuario para referencia */}
          <div className="input-group">
            <label>ID Usuario</label>
            <input 
              type="text" 
              value={formData.id} 
              readOnly 
              className="input-readonly" 
              disabled={true}
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="nombres">Nombres</label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="apellidos">Apellidos</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="correo_electronico">Correo Electrónico</label>
              <input
                type="email"
                id="correo_electronico"
                name="correo_electronico"
                value={formData.correo_electronico}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="sexo">Sexo</label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="genero">Género</label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione...</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="pais">País</label>
              <select
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione...</option>
                {paises.map(pais => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* NUEVO: Sección para cambiar contraseña */}
            <div className="input-group">
              <label htmlFor="contraseniaActual">Contraseña Actual (requerida para cambio)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarContrasenia ? 'text' : 'password'}
                  id="contraseniaActual"
                  name="contraseniaActual"
                  value={contraseniaActual}
                  onChange={handleContraseniaActualChange}
                  placeholder="Ingrese contraseña actual"
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
                >
                  {mostrarContrasenia ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="contrasenia">Nueva Contraseña (opcional)</label>
              <input
                type={mostrarContrasenia ? 'text' : 'password'}
                id="contrasenia"
                name="contrasenia"
                value={formData.contrasenia}
                onChange={handleInputChange}
                placeholder="Deje vacío para no cambiar contraseña"
              />
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="administrador"
                  checked={formData.administrador === true}
                  onChange={handleCheckboxChange}
                />
                Administrador
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="ciudadano"
                  checked={formData.ciudadano === true}
                  onChange={handleCheckboxChange}
                />
                Ciudadano
              </label>
            </div>

            <div className="checkbox-group">
              <label>
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
              <div className="error-message">{error}</div>
            )}

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar Usuario'}
            </button>
          </form>

          <div className="text-center">
          </div>
        </div>
      </div>
    </div>
  );
}
