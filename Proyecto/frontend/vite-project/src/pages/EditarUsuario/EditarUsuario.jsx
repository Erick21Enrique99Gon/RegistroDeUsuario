import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    obtenerUsuario,
    listarPasaportesUsuario,
    habilitarPasaporteUsuario
} from '../../services/AdministracionServices';
import { useNavigate } from 'react-router-dom';

function DetalleUsuarioConPasaportes() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [pasaportes, setPasaportes] = useState([]);
    const [error, setError] = useState(null);
    const [loadingBtn, setLoadingBtn] = useState(null); // numero_de_pasaporte+lugar

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setError(null);
                const [userData, pasaportesData] = await Promise.all([
                    obtenerUsuario(id),
                    listarPasaportesUsuario(id)
                ]);
                setUsuario(userData);
                setPasaportes(Array.isArray(pasaportesData) ? pasaportesData : []);
            } catch (err) {
                console.error(err);
                setError('Error al cargar la información');
            }
        };
        if (id) cargarDatos();
    }, [id]);

    const handleHabilitarPasaporte = async (pasaporte) => {
        const key = pasaporte.numero_de_pasaporte + pasaporte.lugar;
        if (loadingBtn === key) return;

        try {
            setLoadingBtn(key);
            setError(null);

            await habilitarPasaporteUsuario(
                id,
                pasaporte.numero_de_pasaporte,
                pasaporte.lugar
            );

            // Recargar los pasaportes desde el servidor
            const pasaportesActualizados = await listarPasaportesUsuario(id);
            setPasaportes(Array.isArray(pasaportesActualizados) ? pasaportesActualizados : []);
        } catch (err) {
            console.error(err);
            setError('Error al habilitar el pasaporte');
        } finally {
            setLoadingBtn(null);
        }
    };

    if (!usuario) return <p>Cargando...</p>;

    return (
        <div className="login-container">
            <div className="login-content">
                <h2 className="text-center">Detalle de Usuario</h2>
                <div className="login-box">
                    {error && <div className="error-message">{error}</div>}

                    <p><strong>Correo:</strong> {usuario.correo_electronico}</p>
                    <p><strong>Teléfono:</strong> {usuario.telefono}</p>
                    <p><strong>Nombres:</strong> {usuario.nombres}</p>
                    
                    <div className="text-center" style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => navigate(`/registrar-pasaporte/${id}`)}
                    >
                        + Registrar Nuevo Pasaporte
                    </button>
                    </div>

                    <h3 className="text-center" style={{ marginTop: '20px' }}>
                        Mis Pasaportes
                    </h3>

                    {pasaportes.length === 0 ? (
                        <p className="text-center">No tienes pasaportes registrados.</p>
                    ) : (
                        <div className="pasaportes-list">
                            {pasaportes.map((pasaporte, index) => {
                                const key = pasaporte.numero_de_pasaporte + pasaporte.lugar || index;
                                const isLoading = loadingBtn === key;
                                const activo = !!pasaporte.habilitado;

                                return (
                                    <div key={key} className="pasaporte-card">
                                        <div className="input-group">
                                            <label><strong>Número:</strong></label>
                                            <span>{pasaporte.numero_de_pasaporte}</span>
                                        </div>

                                        <div className="input-group">
                                            <label><strong>Tipo:</strong></label>
                                            <span>{pasaporte.tipo_de_pasaporte}</span>
                                        </div>

                                        <div className="input-group">
                                            <label><strong>Fecha Emisión:</strong></label>
                                            <span>
                                                {new Date(pasaporte.fecha_de_emision)
                                                    .toLocaleDateString('es-EC')}
                                            </span>
                                        </div>

                                        <div className="input-group">
                                            <label><strong>Fecha Vencimiento:</strong></label>
                                            <span>
                                                {new Date(pasaporte.fecha_de_vencimiento)
                                                    .toLocaleDateString('es-EC')}
                                            </span>
                                        </div>

                                        <div className="input-group">
                                            <label><strong>Lugar:</strong></label>
                                            <span>{pasaporte.lugar}</span>
                                        </div>

                                        <div className="input-group">
                                            <label><strong>Estado:</strong></label>
                                            <span
                                                className={`status-${activo ? 'active' : 'inactive'}`}
                                            >
                                                {activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>

                                        {/* Botón para habilitar */}
                                        {!activo && (
                                            <button
                                                className="btn-habilitar"
                                                onClick={() => handleHabilitarPasaporte(pasaporte)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Habilitando...' : 'Habilitar'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="text-center" style={{ marginTop: '20px' }}>
                        <a href="/usuarios" className="btn-link">← Volver a usuarios</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetalleUsuarioConPasaportes;
