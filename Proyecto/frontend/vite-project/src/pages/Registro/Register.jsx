import { registrarUsuario, listarPaises } from '../../services/AdministracionServices';
import { useState, useEffect } from 'react';

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
            console.log('Enviando datos de registro:', formData);
            const response = await registrarUsuario(formData);
            console.log('Registro exitoso:', response);

            // Redirigir al login o mostrar mensaje de éxito
            alert('Registro exitoso. Puedes iniciar sesión.');
            // window.location.href = '/login'; // Descomenta para redirigir
        } catch (err) {
            console.error('Error en registro:', err);
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <h2 className="text-center">Registro</h2>
                <div className="login-box">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="nombres">Nombres *</label>
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
                            <label htmlFor="apellidos">Apellidos *</label>
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
                            <label htmlFor="correo_electronico">Correo Electrónico *</label>
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
                            <label htmlFor="telefono">Teléfono *</label>
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
                            <label htmlFor="contrasenia">Contraseña *</label>
                            <input
                                type="password"
                                id="contrasenia"
                                name="contrasenia"
                                value={formData.contrasenia}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="sexo">Sexo *</label>
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
                            >
                                <option value="">Seleccione...</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="pais">País *</label>
                            <select
                                id="pais"
                                name="pais"
                                value={formData.pais}
                                onChange={handleInputChange}
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

                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="administrador"
                                    checked={formData.administrador}
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
                                    checked={formData.ciudadano}
                                    onChange={handleCheckboxChange}
                                />
                                Ciudadano
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
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </form>

                    <div className="text-center">
                        <p>¿Ya tienes cuenta? <a href="/login">Iniciar Sesión</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
