import React, { useEffect, useState } from "react";
import ListarPasaportes from "../PasaportesUsuario/PasaporteUsuario";
import { listarPasaportes } from "../../services/AdministracionServices";
import { useNavigate } from 'react-router-dom';
const ListarTodosPasaportes = () => {
  const [pasaportes, setPasaportes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerPasaportes = async () => {
      try {
        const respuesta = await listarPasaportes()
        
        setPasaportes(respuesta);
      } catch (error) {
        console.error("Error al listar pasaportes", error);
      }
    };

    obtenerPasaportes();
  }, []);

  const irADetalle = (idUsuario, numeroPasaporte, lugar) => {
    // Construye la URL: /obtenerPasaporte/:usuarioId/:pasaporte/:lugar
    navigate(`/obtenerPasaporte/${idUsuario}/${numeroPasaporte}/${lugar}`);
  };
  return (
    <div className="container mt-4">
      <h2>Lista de Pasaportes</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Id Usuario</th>
            <th>Tipo</th>
            <th>Fecha Emisión</th>
            <th>Fecha Vencimiento</th>
            <th>Lugar</th>
            <th>País Emisión</th>
            <th>Número</th>
            <th>Habilitado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pasaportes.map((p, index) => (
            <tr key={index}>
              <td>{p.id_usuario}</td>
              <td>{p.tipo_de_pasaporte}</td>
              <td>{p.fecha_de_emision}</td>
              <td>{p.fecha_de_vencimiento}</td>
              <td>{p.lugar}</td>
              <td>{p.pais_de_emision}</td>
              <td>{p.numero_de_pasaporte}</td>
              <td>{p.habilitado ? "Sí" : "No"}</td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    irADetalle(p.id_usuario, p.numero_de_pasaporte, p.lugar)
                  }
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListarTodosPasaportes;
