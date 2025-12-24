import { useState } from "react";
import { autenticarUsuario } from "../../services/AdministracionServices";
import { setCookie } from '../../utils/cookies';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ id: "", contrasenia: "" });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const resp = await autenticarUsuario(formData.id, formData.contrasenia);

    if (resp.autenticacion) {
      setCookie("autenticacion", true);
      setCookie("usuario", resp.usuario);
      navigate("/modified");
    } else {
      setError("Identificación o contraseña incorrecta");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="glass-card">
          <div className="flag-accent" />
          <h2 className="login-title">Ingreso al Sistema</h2>
          <p className="login-subtitle">
            Autenticación de usuarios de pasaportes
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="id" className="input-label">Identificación</label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Número de documento"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="contrasenia" className="input-label">Contraseña</label>
              <input
                type="password"
                id="contrasenia"
                name="contrasenia"
                value={formData.contrasenia}
                onChange={handleInputChange}
                className="input-field"
                placeholder="********"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn">
              Iniciar sesión
            </button>
          </form>

          <div className="register-link">
            <span>¿No tienes cuenta?</span>
            <a href="/register">Registrarse</a>
          </div>
        </div>
      </div>
    </div>
  );
}
