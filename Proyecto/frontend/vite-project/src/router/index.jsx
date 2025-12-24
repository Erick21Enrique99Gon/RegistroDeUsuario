import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { getCookie } from "../utils/cookies";

import Login from "../pages/Login/Login";
import Register from "../pages/Registro/Register";
import ModificarUsuario from "../pages/Modificar/Modifiad";
import ListarPasaportes from "../pages/PasaportesUsuario/PasaporteUsuario";
import ListarUsuarios from "../pages/ListarUsuarios/ListarUsuarios";
import EditarUsuario from "../pages/EditarUsuario/EditarUsuario";
import RegistrarPasaporte from "../pages/RegistrarPasaporte/RegistrarPasaporte";
import ListarTodosPasaportes from "../pages/ListarPasaportes/ListarTodosPasportes";
import DetallePasaporte from "../pages/DetallePasaporte/DetallePasporte";

import Navbar from "../components/Navbar";

const CiudadanoRoute = ({ children }) => {
  const location = useLocation();
  const usuarioCookie = getCookie('usuario');
  
  console.log('RAW cookie usuario:', usuarioCookie);
  
  const esCiudadano = !!usuarioCookie && 
    usuarioCookie.habilitado === true && 
    usuarioCookie.ciudadano === true;

  console.log('esCiudadano:', esCiudadano, 'location:', location.pathname);

  return esCiudadano ? children : <Navigate to="/login" replace state={{ from: location }} />;
};


const AdminRoute = ({ children }) => {
  const location = useLocation();
  const usuarioCookie = getCookie('usuario');
  
  console.log('RAW cookie usuario:', usuarioCookie);
  
  const esAdmin = !!usuarioCookie && 
    usuarioCookie.habilitado === true && 
    usuarioCookie.ciudadano === true &&
    usuarioCookie.administrador === true;

  console.log('esAdmin:', esAdmin, 'location:', location.pathname);

  return esAdmin ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

const AppRouter = () => {
  return (
    <Router>
      <Navbar />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas solo para Ciudadanos */}
          <Route 
            path="/modified" 
            element={
              <CiudadanoRoute>
                <ModificarUsuario />
              </CiudadanoRoute>
            } 
          />
          <Route 
            path="/mispasaportes" 
            element={
              <CiudadanoRoute>
                <ListarPasaportes />
              </CiudadanoRoute>
            } 
          />

          {/* Rutas solo para Administradores */}
          <Route path="/usuarios" element={
            <AdminRoute>
              <ListarUsuarios />
            </AdminRoute>
          } />
          <Route path="/editarUsuario/:id" element={
            <AdminRoute>
              <EditarUsuario />
            </AdminRoute>
          } />
          <Route path="/registrar-pasaporte/:id" element={
            <AdminRoute>
              <RegistrarPasaporte />
            </AdminRoute>
          } />
          <Route path="/listartodospasaportes" element={
            <AdminRoute>
              <ListarTodosPasaportes />
            </AdminRoute>
          } />
          <Route path="/obtenerPasaporte/:usuarioId/:pasaporte/:lugar" element={
            <AdminRoute>
              <DetallePasaporte />
            </AdminRoute>
          } />
        </Routes>
          
    </Router>
  );
};

export default AppRouter;
