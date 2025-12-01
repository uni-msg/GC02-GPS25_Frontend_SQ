import React, { useContext, useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga.js';
import PerfilDefecto from '../../Recursos/perfilDefecto.png';
import ComunidadDefecto from '../../Recursos/comunidadDefecto.png'; // Imagen por defecto para comunidades

// Importamos todas las funciones necesarias del servicio
import {
    getPublicacionesComunidad,
    getMiembrosComunidad,
    unirseComunidad,
    salirComunidad,
    getLikesPublicacion,
    darLikePublicacion,
    quitarLikePublicacion
} from '../../ApiServices/ComunidadService.js';
import './MasInfoComunidad.css';

const MasInfoComunidad = () => {
    const location = useLocation();
    const comunidad = location.state;

    const [publicaciones, setPublicaciones] = useState([]);
    const [miembros, setMiembros] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [esMiembro, setEsMiembro] = useState(false);
    const [likesUsuario, setLikesUsuario] = useState({}); 
    
    const { isLoggedIn, idLoggedIn } = useContext(UsuarioContext);

    useEffect(() => {
        if (comunidad?.idComunidad) {
            fetchData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comunidad]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Carga paralela usando las funciones del servicio
            const [dataPublis, dataMiembros] = await Promise.all([
                getPublicacionesComunidad(comunidad.idComunidad),
                getMiembrosComunidad(comunidad.idComunidad)
            ]);

            setPublicaciones(dataPublis);
            setMiembros(dataMiembros);

            if (isLoggedIn && idLoggedIn) {
                const soyYo = dataMiembros.find(m => m.idUsuario.toString() === idLoggedIn.toString());
                setEsMiembro(!!soyYo);
                await checkLikes(dataPublis);
            }
        } catch (err) {
            console.error("Error al cargar detalles:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const checkLikes = async (publis) => {
        const likesStatus = {};
        for (const pub of publis) {
            try {
                // Llamada al servicio para verificar likes
                const listaLikes = await getLikesPublicacion(pub.idPublicacion);
                const diLike = listaLikes.some(l => l.idUsuario.toString() === idLoggedIn.toString());
                likesStatus[pub.idPublicacion] = diLike;
            } catch (e) {
                console.warn(`Could not check like for post ${pub.idPublicacion}`);
            }
        }
        setLikesUsuario(likesStatus);
    };

    const toggleLike = async (idPublicacion) => {
        if (!isLoggedIn) return alert("Inicia sesión para dar like");
        if (!esMiembro) return alert("Debes unirte a la comunidad para dar like");

        const yaDioLike = likesUsuario[idPublicacion];

        try {
            let data;
            // Llamadas al servicio para dar/quitar like
            if (yaDioLike) {
                data = await quitarLikePublicacion(idPublicacion, idLoggedIn);
            } else {
                data = await darLikePublicacion(idPublicacion, idLoggedIn);
            }

            setLikesUsuario(prev => ({ ...prev, [idPublicacion]: !yaDioLike }));
            setPublicaciones(prev => prev.map(p => {
                if (p.idPublicacion === idPublicacion) {
                    return { ...p, meGusta: data.meGusta };
                }
                return p;
            }));

        } catch (err) {
            alert(err.message);
        }
    };

    const toggleMembresia = async () => {
        if (!isLoggedIn) return alert("Debes iniciar sesión para unirte.");

        try {
            // Llamadas al servicio para unirse/salir
            if (esMiembro) {
                await salirComunidad(comunidad.idComunidad, idLoggedIn);
                setEsMiembro(false);
                setMiembros(prev => prev.filter(m => m.idUsuario.toString() !== idLoggedIn.toString()));
            } else {
                const nuevoMiembro = await unirseComunidad(comunidad.idComunidad, idLoggedIn);
                setEsMiembro(true);
                setMiembros(prev => [...prev, nuevoMiembro]);
                checkLikes(publicaciones);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    if (error) return <div className="p-5 error-text">Error: {error}</div>;
    if (!comunidad) return <div className="p-5">No se ha encontrado la comunidad especificada.</div>;

    return (
        <div id="masInfoComunidad">
            <div className="comunidad-header-info">
                <h1 className="titulo-comunidad">
                    {comunidad.nombreComunidad}
                    {isLoggedIn && (
                        <button 
                            type="button" 
                            className={`btnUnirse ${esMiembro ? 'btn-danger' : 'btn-success'}`} 
                            onClick={toggleMembresia}
                        >
                            {esMiembro ? "Salir de la Comunidad" : "Unirse a la Comunidad"}
                        </button>
                    )}
                </h1>
                <img
                    src={comunidad.rutaImagen || ComunidadDefecto}
                    alt={comunidad.nombreComunidad}
                    className="imagen-detalle"
                />
                <div className="desc-comunidad">
                    <p>{comunidad.descComunidad || "Sin descripción."}</p>
                </div>
                <div className="datos-extra">
                    <span className="badge-artista">Creado por: {comunidad.artista?.nombreUsuario || "Desconocido"}</span>
                    <span className="fecha-creacion">Desde: {new Date(comunidad.fechaCreacion).toLocaleDateString()}</span>
                </div>
            </div>

            <div id="contenidoComunidad">
                {isLoading ? (
                    <PantallaCarga />
                ) : (
                    <div className="grid-contenido">
                        <div className="seccion-publicaciones">
                            <h3>Publicaciones ({publicaciones.length})</h3>
                            {publicaciones.length === 0 ? (
                                <p className="text-muted">Aún no hay publicaciones.</p>
                            ) : (
                                <div className="lista-publicaciones">
                                    {publicaciones.map((pub) => (
                                        <div key={pub.idPublicacion} className="publicacion-card">
                                            <h4>{pub.titulo}</h4>
                                            <p className="pub-contenido">{pub.contenido}</p>
                                            <div className="pub-footer">
                                                <span><i className="bi bi-calendar3"></i> {new Date(pub.fecha).toLocaleDateString()}</span>
                                                <button 
                                                    className="btn-like" 
                                                    onClick={() => toggleLike(pub.idPublicacion)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    {likesUsuario[pub.idPublicacion] ? (
                                                        <i className="bi bi-heart-fill text-danger fs-5"></i>
                                                    ) : (
                                                        <i className="bi bi-heart text-danger fs-5"></i>
                                                    )}
                                                    <span className="ms-2">{pub.meGusta}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="seccion-miembros">
                            <h3>Miembros ({miembros.length})</h3>
                            <ul className="lista-miembros">
                                {miembros.map((miembro) => (
                                    <li key={miembro.idUsuario} className="miembro-item">
                                        <img 
                                            src={miembro.rutaFoto || PerfilDefecto} 
                                            alt="avatar" 
                                            className="miembro-avatar"
                                        />
                                        <span>{miembro.nombreUsuario || `Usuario ${miembro.idUsuario}`}</span>
                                        {miembro.esArtista && <i className="bi bi-patch-check-fill text-primary ms-2" title="Artista verificado"></i>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasInfoComunidad;