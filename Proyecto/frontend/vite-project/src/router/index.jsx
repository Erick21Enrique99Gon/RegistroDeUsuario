import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Registro/Register";
import ModificarUsuario from "../pages/Modificar/Modifiad";

import { getCookie } from "../utils/cookies";
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/modifaid" element={<ModificarUsuario/>} />
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
      </Routes>
    </Router>
  );
};

export default AppRouter;