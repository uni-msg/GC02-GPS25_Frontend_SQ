import './MasInfoPerfil.css';
import React, { useContext, useEffect, useState } from "react";
import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';
import { useLocation, useNavigate } from 'react-router-dom';

import {URL_FOTO , CLOUD_URL_DEFAULT } from '../../config.js';

// 1. IMPORTANTE: Añadimos getArtistaById
import { getElementosArtistasP } from '../../ApiServices/ElementosService';
import { getCancionesByAlbum } from "./../../ApiServices/CancionesService.js"
import { postFavorito, deleteFavorito, getFavoritosByIds } from "./../../ApiServices/UsuarioService.js"
import { getArtistaById } from '../../ApiServices/ArtistasService.js'; 
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga.js';

const MasInfoPerfil = () => {
    const location = useLocation();
    const stateRecibido = location.state; // Puede ser un Objeto Artista O un ID (entero)

    // 2. Convertimos 'artista' en un estado. Inicialmente es null o el objeto si ya venía completo.
    const [artista, setArtista] = useState(
        (stateRecibido && typeof stateRecibido === 'object') ? stateRecibido : null
    );

    const [elementosCreados, setElementosCreados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [cancionesAlbum, setCancionesAlbum] = useState({});
    const [expandido, setExpandido] = useState({});
    const { isLoggedIn, idLoggedIn, token } = useContext(UsuarioContext);
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    // 3. Lógica unificada para cargar Artista (si hace falta) y sus Elementos
    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            try {
                let idParaBuscar = null;
                let datosArtista = artista;

                // Caso A: Nos llegó solo el ID (desde el catálogo filtrado o buscador)
                if (typeof stateRecibido === 'number' || typeof stateRecibido === 'string') {
                    idParaBuscar = stateRecibido;
                    // Descargamos la info del artista
                    datosArtista = await getArtistaById(idParaBuscar);
                    setArtista(datosArtista);
                    console.log("Datos del artista cargados:", datosArtista);
                } 
                // Caso B: Nos llegó el objeto completo
                else if (stateRecibido?.id) {
                    idParaBuscar = stateRecibido.id;
                    // Ya tenemos los datos en 'artista', no hace falta fetch
                }

                // Si tenemos un ID válido, cargamos sus canciones/álbumes y favoritos
                if (idParaBuscar) {
                    // Cargar Elementos (CORREGIDO: Quitamos el 'null' extra)
                    const creados = await getElementosArtistasP(idParaBuscar);
                    setElementosCreados(creados);
                    console.log("Elementos creados por el artista:", creados);
                }

            } catch (error) {
                console.error("Error al cargar perfil:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateRecibido, isLoggedIn, token, idLoggedIn]); 

    useEffect(() => {
        const verificarFavorito = async () => {
            if (token && idLoggedIn && stateRecibido?.id != null) {
            try {
                const yaFavorito = await getFavoritosByIds(token, idLoggedIn,stateRecibido.id, true)
                
                setIsFavorite(yaFavorito);
            } catch (error) {
                console.error("Error al verificar si es favorito:", error);
            }
            }
        };
        verificarFavorito();
    }, [token, idLoggedIn, stateRecibido?.id]); // Se ejecuta cuando cambie el token, id o la canción


    // Función para cargar canciones de un álbum específico
    const obtenerCanciones = async (idAlbum) => {
        try {
            const cancionesAlb = await getCancionesByAlbum(idAlbum);
            setCancionesAlbum(prev => ({
                ...prev,
                [idAlbum]: cancionesAlb
            }));
        } catch (error) {
            console.error("Error al cargar canciones del álbum:", error);
        }
    };

    // Función para expandir o contraer álbumes
    const verCancionesAlbum = (idAlbum) => {
        setExpandido(prev => ({
            ...prev,
            [idAlbum]: !prev[idAlbum]
        }));
        obtenerCanciones(idAlbum);
    };

    const verMasElemento = (item, tipo) => {
        if (tipo === 1) {
            navigate("/masInfoAlbum", { state: item });
        } else {
            navigate("/masInfo", { state: item });
        }
    };

    const renderStars = (rating) => {
        // Protección por si rating es undefined al inicio
        const safeRating = rating || 0;
        return Array.from({ length: 5 }, (_, i) => (
            <i
                key={i}
                className={
                    i < safeRating
                        ? "bi bi-file-music-fill text-info my-icon" 
                        : "bi bi-file-music text-info my-icon"
                }
            />
        ));
    };

    const toggleFavorite = async () => {
        const cambioEstado = !isFavorite
        setIsFavorite(cambioEstado);

        if (isLoggedIn && artista?.id != null) {
            try {
                if (cambioEstado) {
                    const relacion = {
                        idusuario: idLoggedIn,
                        idelemento: artista.id,
                        tipo: 0
                    };

                    await postFavorito(token, relacion);
                } else {
                    await deleteFavorito(token, idLoggedIn, artista.id, true);
                }
            } catch (error) {
                console.error("❌ Error al actualizar favorito:", error);
                // Revertimos si falla
                setIsFavorite(!cambioEstado);
            }
        }
    };

    // Renderizado condicional
    if (cargando) return <PantallaCarga />;
    if (!artista) return <div>No se ha encontrado el artista.</div>;

    return (
        <div id="masInfoPerfil">
            <div className="perfil-info">
                <h1 className={artista.esNovedad ? "text-esNovedad" : ""}>
                    {artista.nombre}
                    {isLoggedIn && (
                        <button type="button" className="btnFavoritePer" onClick={toggleFavorite}>
                            {isFavorite ? (
                                <i className="fa-solid fa-star"></i>
                            ) : (
                                <i className="fa-regular fa-star"></i>
                            )}
                        </button>
                    )}
                </h1>
                <img
                    src={artista.fotoAmazon && artista.fotoAmazon !== "null"
                        ? `${URL_FOTO}${artista.fotoAmazon}`
                        : CLOUD_URL_DEFAULT}
                    alt="Foto del artista"
                    className="card-img-top card-img-circle"
                />
                <div className='puntuacion mb-1'>{renderStars(artista.valoracion)}</div>
                <div className="desc">
                    <p>{artista.descripcion}</p>
                </div>
                <div className="anio">
                    {/* Protección de fecha */}
                    <p className="mb-0">Inicio de la Carrera: {artista.fechaCrea ? new Date(artista.fechaCrea).toLocaleDateString() : 'Desconocida'}</p>
                </div>
                <div className="oye">
                    <p>Número de Oyentes: {artista.oyentes}</p>
                </div>
                <div id="etiquetas">
                    {/* Protección de género por si es objeto o string */}
                    <span className="tags me-2">{artista.genero?.nombre || artista.genero || 'Sin género'}</span>
                </div>
            </div>

            <div id="listaElementos">
                <h3>Elementos del artista:</h3>
                
                <div className="canciones-listado">
                    {elementosCreados.length === 0 ? (
                        <p className="text-muted">Este artista aún no creó ningún elemento.</p>
                    ) : (
                        <div id="listaElementos">
                            {elementosCreados.filter(elem => elem.esalbum).map((elem) => (
                                <div key={elem.id} className="elemento">
                                    <div className="cabeElem">
                                        <h4><i className="fa-solid fa-rectangle-list"></i> {elem.nombre}</h4>
                                        <div>
                                            <button className="botonCanAlb" onClick={() => verCancionesAlbum(elem.id)}>
                                                {expandido[elem.id] ? "Ocultar canciones" : "Ver canciones"}
                                            </button>
                                            <button className="verMasElem" onClick={() => verMasElemento(elem, 1)}>Ver más</button>
                                        </div>
                                    </div>

                                    {elem.esalbum && expandido[elem.id] && (
                                        <div className="canciones">
                                            {cancionesAlbum[elem.id]?.map((can, index) => (
                                                <div key={can.idelemento} className="cardCancion">
                                                    <span>{index + 1}. {can.nombre}</span>
                                                    <div>
                                                        <button className="verMasCanc" onClick={() => { verMasElemento(elementosCreados.find(elem => elem.id === can.idelemento), 2); }}>Ver más</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* SECCIÓN DE CANCIONES SUELTAS (SINGLES) */}
                            {/* Cambiamos 'elem.album === null' por '!elem.album' */}
                            {elementosCreados.filter(elem => !elem.esalbum && !elem.album).map((elem) => (
                                <div key={elem.id} className="elemento">
                                    <div className="cabeElem">
                                        <h4><i className="fa-solid fa-record-vinyl"></i> {elem.nombre}</h4>
                                        <div>
                                            <button className="verMasElem" onClick={() => verMasElemento(elem, 2)}>Ver más</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}
                </div>
                
            </div>
        </div>
    );
};

export default MasInfoPerfil;