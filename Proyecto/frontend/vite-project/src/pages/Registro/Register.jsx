import { registrarUsuario, listarPaises } from '../../services/AdministracionServices';
import { useState, useEffect } from 'react';
import "./Login.css"; // MISMO CSS que el login

export default function Register() {
  const [formData, setFormData] = useState({
    correo_electronico: '',
    telefono: '',
    nombres: '',
    apellidos: '',
    sexo: '',
    genero: '',
    pais: 1,
    contrasenia: '',
    administrador: false,
    ciudadano: true,
    habilitado: true,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paises, setPaises] = useState([]);

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const resp = await listarPaises();
        setPaises(resp);
      } catch (error) {
        console.error('Error al cargar países', error);
      }
    };

    fetchPaises();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await registrarUsuario(formData);
      console.log('Registro exitoso:', response);
      alert('Registro exitoso. Puedes iniciar sesión.');
      // window.location.href = '/login';
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="glass-card">
          <div className="flag-accent" />
          <h2 className="login-title">Registro de usuario</h2>
          <p className="login-subtitle">
            Completa tus datos para crear tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Nombres y apellidos */}
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="nombres" className="input-label">Nombres *</label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="apellidos" className="input-label">Apellidos *</label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Correo y teléfono */}
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="correo_electronico" className="input-label">Correo electrónico *</label>
                <input
                  type="email"
                  id="correo_electronico"
                  name="correo_electronico"
                  value={formData.correo_electronico}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="telefono" className="input-label">Teléfono *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="input-group">
              <label htmlFor="contrasenia" className="input-label">Contraseña *</label>
              <input
                type="password"
                id="contrasenia"
                name="contrasenia"
                value={formData.contrasenia}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            {/* Sexo, género y país */}
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="sexo" className="input-label">Sexo *</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleInputChange}
                  className="input-field"
                  required
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
                  className="input-field"
                >
                  <option value="">Seleccione...</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="pais" className="input-label">País *</label>
              <select
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Seleccione...</option>
                {paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="administrador"
                  checked={formData.administrador}
                  onChange={handleCheckboxChange}
                />
                Administrador
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="ciudadano"
                  checked={formData.ciudadano}
                  onChange={handleCheckboxChange}
                />
                Ciudadano
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="register-link">
            <span>¿Ya tienes cuenta?</span>
            <a href="/login">Iniciar sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
}
