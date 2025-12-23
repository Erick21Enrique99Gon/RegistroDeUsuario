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
// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const usuarioCookie = getCookie('usuario');

  console.log('RAW cookie usuario:', usuarioCookie);

  const esAutorizado =
    !!usuarioCookie && usuarioCookie.habilitado === true && usuarioCookie.ciudadano === true;

  console.log('esAutorizado:', esAutorizado, 'location:', location.pathname);

  return esAutorizado
    ? children
    : <Navigate to="/login" replace state={{ from: location }} />;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        
        {/* <Route path="/" element={<SidebarLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="inventario-ingreso" element={<InventarioIngreso />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="Productos" element={<Productos />} />
          <Route path="vendedores" element={<Vendedores />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="pagos" element={<Pagos />} />
        </Route> */}

        <Route path="/login" element={<Login />} />
        <Route path="/usuarios" element={<ListarUsuarios />} />
        <Route path="/editarUsuario/:id" element={<EditarUsuario />} />
        <Route path="/registrar-pasaporte/:id" element={<RegistrarPasaporte />} />
        <Route path="/listartodospasaportes" element={<ListarTodosPasaportes />} />
        <Route path="/obtenerPasaporte/:usuarioId/:pasaporte/:lugar" element={<DetallePasaporte />} />
        <Route 
          path="/register" 
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/modified" 
          element={
            <ProtectedRoute>
              <ModificarUsuario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mispasaportes" 
          element={
            <ProtectedRoute>
              <ListarPasaportes />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
