import { useState } from "react";
import { autenticarUsuario } from "../../services/AdministracionServices";
import { setCookie } from '../../utils/cookies';

export default function Login() {
  const [formData, setFormData] = useState({
    id: "",
    contrasenia: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const resp = await autenticarUsuario(formData.id, formData.contrasenia);
    console.log(resp)
    // manejar respuesta / navegación
    if (resp.autenticacion) {
      // Guardar cookies solo si autenticación es exitosa
      setCookie('autenticacion', true);
      setCookie('usuario', {
        administrador: resp.usuario.administrador || false,
        apellidos: resp.usuario.apellidos,
        ciudadano: resp.usuario.ciudadano || false,
        correo_electronico: resp.usuario.correo_electronico,
        genero: resp.usuario.genero,
        habilitado: resp.usuario.habilitado || false,
        id: resp.usuario.id,
        nombres: resp.usuario.nombres,
        pais: resp.usuario.pais,
        sexo: resp.usuario.sexo,
        telefono: resp.usuario.telefono
      });
      console.log("Usuario autenticado y guardado en cookies");
      console.log("enviando", formData);
      // Aquí navegar o redirigir
    } else {
      console.log("Autenticación fallida");
    }
    console.log("enviando", formData);
  };


  return (
    <div className="login-container">
      <div className="login-content">
        <h2 className="text-center">Login</h2>
        <div className="login-box">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>IDENTIFICACION</label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="contrasenia">Password</label>
              <input
                type="contrasenia"
                id="contrasenia"
                name="contrasenia"
                value={formData.contrasenia}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn-submit">
              Sign in
            </button>
          </form>
          <div className="text-center">
            <p>
              <a href="/register">Register</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
