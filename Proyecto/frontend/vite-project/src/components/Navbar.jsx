import { NavLink } from "react-router-dom";
import { getCookie, deleteCookie } from "../utils/cookies";
import { useNavigate } from 'react-router-dom';
import './Navbar.css'
const Navbar = () => {
    const navigate = useNavigate();
    const usuario = getCookie("usuario");


    if (location.pathname === "/login" || location.pathname === "/register") {
        return null;
    }


    if (!usuario) return null;

    const esCiudadano = usuario?.habilitado && usuario?.ciudadano;
    const esAdmin = esCiudadano && usuario?.administrador;

    const handleLogout = () => {
        console.log("saliendo")
        deleteCookie("usuario");
        deleteCookie("autenticacion");
        navigate("/login", { replace: true });
    };

    if (!usuario) return null; // nada cuando no esté logueado

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <span className="navbar-logo">Pasaportes</span>

                <div className="navbar-links">
                    {/* Links SOLO ADMIN */}
                    {esAdmin && (
                        <>
                            <NavLink to="/usuarios" className="nav-link">
                                Usuarios
                            </NavLink>
                            <NavLink to="/listartodospasaportes" className="nav-link">
                                Todos los pasaportes
                            </NavLink>
                        </>
                    )}

                    {/* Links SOLO CIUDADANO */}
                    {esCiudadano && (
                        <>
                            <NavLink to="/modified" className="nav-link">
                                Mi perfil
                            </NavLink>
                            <NavLink to="/mispasaportes" className="nav-link">
                                Mis pasaportes
                            </NavLink>
                        </>
                    )}

                    {/* Botón Salir */}
                    <button className="nav-logout" onClick={handleLogout}>
                        Salir
                    </button>


                </div>
            </div>
        </nav>
    );
};

export default Navbar;
