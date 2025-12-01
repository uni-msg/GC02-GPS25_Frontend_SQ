import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { UsuarioContext } from "../InicioSesion/UsuarioContext";
import { 
    getRankingArtistasOyentes, 
    getTopContenidosVentas, 
    getTopGeneros, 
    getRankingComunidadesMiembros,
    getTopContenidosValoracion,
    getTopContenidosComentarios,
    getRankingComunidadesPublicaciones, 
    getTopArtistasBusquedas,
    getTopReproduccionesUsuario // <--- NUEVO IMPORT
} from '../../ApiServices/EstadisticasService';

import { getArtistaById } from '../../ApiServices/ArtistasService';
import { getElementoById } from '../../ApiServices/ElementosService';
import { registrarBusquedaArtista } from '../../ApiServices/EstadisticasService';
import { getComunidadById } from '../../ApiServices/ComunidadService';

import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga';
import './Estadisticas.css';

function Estadisticas() {
    const { token, idLoggedIn, isLoggedIn } = useContext(UsuarioContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 
    
    // Estados para los distintos rankings públicos
    const [topArtistas, setTopArtistas] = useState([]);
    const [topVentas, setTopVentas] = useState([]);
    const [topGeneros, setTopGeneros] = useState([]);
    const [topComunidades, setTopComunidades] = useState([]);       
    const [topComunidadesPublis, setTopComunidadesPublis] = useState([]); 
    const [topValoracion, setTopValoracion] = useState([]);
    const [topComentados, setTopComentados] = useState([]);   
    const [topBusquedas, setTopBusquedas] = useState([]); 

    // Estado para el ranking personal (Privado)
    const [topPersonal, setTopPersonal] = useState([]); // <--- NUEVO ESTADO

    useEffect(() => {
        const cargarDatos = async () => {
            console.log("--- 1. INICIANDO CARGA ---");
            setLoading(true);

            try {
                // 1. Artistas
                const artistasData = await getRankingArtistasOyentes(); 
                
                // 2. Resto de llamadas PÚBLICAS
                const [
                    ventasData, generosData, comunidadesMiembrosData, 
                    valoracionData, comentariosData, comunidadesPublisData, topBusquedasData
                ] = await Promise.all([
                    getTopContenidosVentas(),
                    getTopGeneros(),
                    getRankingComunidadesMiembros(),
                    getTopContenidosValoracion(),
                    getTopContenidosComentarios(),      
                    getRankingComunidadesPublicaciones(), 
                    getTopArtistasBusquedas()
                ]);

                // --- NUEVO: LLAMADA PRIVADA (TOP REPRODUCCIONES) ---
                let personalData = [];
                if (isLoggedIn && token && idLoggedIn) {
                    try {
                        // Obtenemos la lista de DTOs { idContenido, segundosReproducidos (contador) }
                        const rawPersonal = await getTopReproduccionesUsuario(token, idLoggedIn, 5);
                        
                        // Enriquecemos con los datos reales de la canción (nombre, foto, artista...)
                        if (rawPersonal && rawPersonal.length > 0) {
                            const promesasPersonal = rawPersonal.map(async (item) => {
                                try {
                                    const detalle = await getElementoById(token, item.idContenido);
                                    let nombreDelArtista = "Desconocido";

                                    // Lógica para sacar el nombre del artista del objeto detalle
                                    if (detalle.nombreArtista) {
                                        nombreDelArtista = detalle.nombreArtista;
                                    } else if (detalle.artista && typeof detalle.artista === 'object') {
                                        nombreDelArtista = detalle.artista.nombreusuario || detalle.artista.nombreArtistico || "Artista Desconocido";
                                    } else if (typeof detalle.artista === 'string') {
                                        nombreDelArtista = detalle.artista;
                                    }

                                    return {
                                        ...item, // Conservamos el contador (segundosReproducidos)
                                        titulo: detalle.nombre || detalle.nombreAudio || detalle.titulo,
                                        artista: nombreDelArtista,
                                        urlFoto: detalle.urlFoto,
                                        esAlbum: detalle.esAlbum || false,
                                        id: item.idContenido // Para la navegación
                                    };
                                } catch (err) {
                                    return { ...item, titulo: `Canción ${item.idContenido}` };
                                }
                            });
                            personalData = await Promise.all(promesasPersonal);
                        }
                    } catch (error) {
                        console.error("Error cargando top personal:", error);
                    }
                }
                setTopPersonal(personalData);
                // ----------------------------------------------------

                // --- PROCESAR ARTISTAS ---
                if (artistasData.length > 0) {
                    const promesas = artistasData.map(async (artistaBD) => {
                        const artistId = Number(artistaBD.idArtista);
                        try {
                            const detalles = await getArtistaById(artistId);
                            return {
                                ...artistaBD,
                                nombreArtistico: detalles.nombreusuario || detalles.nombre || `Artista ${artistId}`
                            };
                        } catch (error) {
                            return {
                                ...artistaBD,
                                nombreArtistico: `Artista ${artistId}`
                            };
                        }
                    });
                    setTopArtistas(await Promise.all(promesas));
                }

                // --- HELPER PARA ENRIQUECER CONTENIDOS (VENTAS, VALORACIÓN, ETC) ---
                const enriquecerContenido = async (lista) => {
                    if (!lista || lista.length === 0) return [];
                    const promesas = lista.map(async (item) => {
                        try {
                            const detalle = await getElementoById(token, item.idContenido);
                            let nombreDelArtista = null;

                            if (detalle.nombreArtista) {
                                nombreDelArtista = detalle.nombreArtista; 
                            } else if (detalle.artista && typeof detalle.artista === 'object') {
                                nombreDelArtista = detalle.artista.nombreArtistico || detalle.artista.nombreusuario || "Artista Desconocido";
                            } else if (typeof detalle.artista === 'string') {
                                nombreDelArtista = detalle.artista;
                            }

                            return {
                                ...item,
                                titulo: detalle.nombre || detalle.nombreAudio || detalle.titulo || `Elemento ${item.idContenido}`,
                                artista: nombreDelArtista
                            };
                        } catch (error) {
                            return { ...item, titulo: `Contenido ID ${item.idContenido} (Sin info)` };
                        }
                    });
                    return await Promise.all(promesas);
                };

                // --- PROCESAR BÚSQUEDAS ---
                const rawBusquedas = topBusquedasData.data || topBusquedasData || [];
                if (rawBusquedas.length > 0) {
                    const promesasBusquedas = rawBusquedas.map(async (item) => {
                        const artistId = Number(item.idArtista);
                        try {
                            const detalles = await getArtistaById(artistId);
                            return {
                                ...item,
                                nombreArtistico: detalles.nombreusuario || detalles.nombre || `Artista ${artistId}`
                            };
                        } catch (error) {
                            return { ...item, nombreArtistico: `Artista ${artistId}` };
                        }
                    });
                    setTopBusquedas(await Promise.all(promesasBusquedas));
                } else {
                    setTopBusquedas([]);
                }

                // --- C. HELPER PARA COMUNIDADES ---
                const enriquecerComunidades = async (lista) => {
                    const datosRaw = lista.data || lista || []; 
                    if (!datosRaw.length) return [];

                    const promesas = datosRaw.map(async (item) => {
                        try {
                            // Obtenemos el detalle completo
                            const detalle = await getComunidadById(item.idComunidad);            
                            
                            return {
                                ...item,
                                // Guardamos todo el objeto detalle para tenerlo listo
                                ...detalle,
                                nombre: detalle.nombreComunidad || `Comunidad ${item.idComunidad}`
                            };
                        } catch (error) {
                            console.error(`❌ Error peticionando comunidad ${item.idComunidad}:`, error);
                            return { ...item, nombre: `Comunidad ${item.idComunidad}` };
                        }
                    });
                    return await Promise.all(promesas);
                };

                // Procesamos Comunidades
                setTopComunidades(await enriquecerComunidades(comunidadesMiembrosData));
                setTopComunidadesPublis(await enriquecerComunidades(comunidadesPublisData));

                // Procesamos resto de listas
                setTopVentas(await enriquecerContenido(ventasData));
                setTopValoracion(await enriquecerContenido(valoracionData));
                setTopComentados(await enriquecerContenido(comentariosData));

                setTopGeneros(generosData.data || generosData || []);

            } catch (error) {
                console.error("ERROR EN ESTADÍSTICAS:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [token, idLoggedIn, isLoggedIn]); // Añadido isLoggedIn a dependencias

    // ---------------------------------------------------------
    //  NAVEGACIÓN MODIFICADA PARA INCLUIR COMUNIDADES
    // ---------------------------------------------------------

    const handleNavigation = async (tipo, item) => {
        
        // Determinar el ID correcto.
        const id = item.idContenido || item.idArtista || item.idComunidad || item.id;
        
        console.log(`Navegando a ${tipo} con ID: ${id}`);

        let itemCompleto = item; 
        let ruta = '';

        try {
            // 1. Caso ÁLBUM / CANCIÓN
            if (tipo === 'album' || tipo === 'cancion') {
                const dataDB = await getElementoById(token, id);
                if (dataDB) itemCompleto = dataDB;
                
                ruta = (tipo === 'album') ? '/masInfoAlbum' : '/masInfo';
            }

            // 2. Caso ARTISTA
            else if (tipo === 'artista') {
                const dataDB = await getArtistaById(id);
                if (dataDB) itemCompleto = dataDB;
                
                    registrarBusquedaArtista(token, id, idLoggedIn).catch(err => console.error(err));
                
                ruta = '/masInfoPerfil';
            }

            // 3. NUEVO CASO: COMUNIDAD
            else if (tipo === 'comunidad') {
                // Recuperamos el objeto completo usando el servicio que indicaste
                const dataDB = await getComunidadById(id);
                if (dataDB) {
                    itemCompleto = dataDB; 
                }
                
                ruta = '/masInfoComunidad'; 
            }

        } catch (error) {
            console.error("Error obteniendo detalles completos para navegación:", error);
            // Si falla, navegamos con los datos básicos que ya teníamos
        }

        // Navegar
        if (ruta) {
             navigate(ruta, { state: itemCompleto });
        }
    };

    if (loading) return <PantallaCarga mensaje="Analizando el mercado musical..." />;

    const renderRankIcon = (index) => {
        if (index === 0) return <i className="fa-solid fa-trophy rank-gold"></i>;
        if (index === 1) return <i className="fa-solid fa-trophy rank-silver"></i>;
        if (index === 2) return <i className="fa-solid fa-trophy rank-bronze"></i>;
        return <span className="rank-number">#{index + 1}</span>;
    };

    const clickableStyle = { cursor: 'pointer', transition: 'transform 0.2s' };

    return (
        <div className="estadisticas-container fade-in">
            <h1 className="main-title">
                <i className="fa-solid fa-chart-simple me-3"></i>
                Centro de Estadísticas
            </h1>
            <p className="subtitle">Rankings Globales y Tendencias del Mercado</p>

            <div className="stats-grid">
                
                {/* 1. ARTISTAS */}
                <div className="stat-card artist-card">
                    <div className="card-header-stats">
                        <h2><i className="fa-solid fa-microphone-lines"></i> Artistas Top</h2>
                        <span className="badge-stats">Mensual</span>
                    </div>
                    <div className="ranking-list">
                        {topArtistas.map((artista, idx) => (
                            <div 
                                key={idx} 
                                className={`rank-item rank-${idx + 1}`}
                                onClick={() => handleNavigation('artista', artista)}
                                style={clickableStyle}
                                title="Ver Perfil"
                            >
                                <div className="rank-pos">{renderRankIcon(idx)}</div>
                                <div className="rank-info">
                                    <span className="item-name">
                                        {artista.nombreArtistico || `Artista ${artista.idArtista}`}
                                    </span>
                                    <span className="item-sub">
                                        <i className="fa-solid fa-headphones"></i> 
                                        {(artista.numOyentes || 0).toLocaleString()} Oyentes
                                    </span>
                                </div>
                                <div className="rank-score">
                                    <i className="fa-solid fa-star text-warning"></i> {artista.valoracionMedia || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. VENTAS */}
                <div className="stat-card sales-card">
                    <div className="card-header-stats">
                        <h2><i className="fa-solid fa-cart-shopping"></i> Top Ventas</h2>
                        <span className="badge-stats">Global</span>
                    </div>
                    <div className="ranking-list">
                        {topVentas.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="rank-item"
                                onClick={() => handleNavigation(item.esAlbum ? 'album' : 'cancion', item)}
                                style={clickableStyle}
                            >
                                <div className="rank-pos">{renderRankIcon(idx)}</div>
                                <div className="rank-info">
                                    <span className="item-name">
                                        {item.titulo || `Contenido ${item.idContenido}`}
                                    </span>
                                    {item.artista && (
                                        <span className="item-artist-sub"><small>{item.artista}</small></span>
                                    )}
                                    <span className="item-sub type-badge">
                                        {item.esAlbum ? 'Álbum' : 'Canción'}
                                    </span>
                                </div>
                                <div className="rank-metric">
                                    {(item.numVentas || 0).toLocaleString()} <small>Ventas</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMNA 3: Géneros y Comunidades */}
                <div className="stat-column d-flex flex-column gap-4">
                    
                    {/* Géneros */}
                    <div className="stat-card small-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-music"></i> Géneros</h2>
                        </div>
                        <div className="genre-cloud">
                            {topGeneros.map((gen, idx) => (
                                <div key={idx} className="genre-tag" style={{fontSize: `${1 + (5-idx)*0.1}rem`}}>
                                    {gen.genero}
                                    <span className="genre-count">{gen.totalVentas || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comunidades (Miembros) */}
                    <div className="stat-card small-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-users"></i> Más Populares</h2>
                        </div>
                        <ul className="community-list">
                            {topComunidades.slice(0, 3).map((com, idx) => (
                                <li 
                                    key={idx} 
                                    className="community-item"
                                    onClick={() => handleNavigation('comunidad', com)}
                                    style={clickableStyle} 
                                >
                                    <div className="com-rank">#{idx + 1}</div>
                                    <div className="com-details">
                                        <strong className="text-truncate">
                                            {com.nombre}
                                        </strong>
                                        <small>{(com.numMiembros || 0).toLocaleString()} Miembros</small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="stat-column d-flex flex-column gap-4">
                    {/* Comunidades (Publicaciones) */}
                    <div className="stat-card small-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-pen-to-square"></i> Más Activas</h2>
                        </div>
                        <ul className="community-list">
                            {topComunidadesPublis.slice(0, 3).map((com, idx) => (
                                <li 
                                    key={idx} 
                                    className="community-item"
                                    onClick={() => handleNavigation('comunidad', com)}
                                    style={clickableStyle}
                                >
                                    <div className="com-rank">#{idx + 1}</div>
                                    <div className="com-details">
                                        <strong className="text-truncate">
                                            {com.nombre}
                                        </strong>
                                        <small>
                                            {(com.numPublicaciones || com.totalPublicaciones || 0).toLocaleString()} Publicaciones
                                        </small> 
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 6. TOP BÚSQUEDAS */}
                    <div className="stat-card rating-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-magnifying-glass"></i> Artistas Más Buscados</h2>
                        </div>
                        <div className="ranking-list">
                            {topBusquedas.map((artista, idx) => (  
                                <div 
                                    key={idx} 
                                    className="rank-item"
                                    onClick={() => handleNavigation('artista', artista)}
                                    style={clickableStyle}
                                >
                                    <div className="rank-pos-circle orange">{idx + 1}</div>
                                    <div className="rank-info">
                                        <span className="item-name">
                                            {artista.nombreArtistico}
                                        </span>
                                    </div>
                                    <div className="rank-metric">
                                        <i className="fa-solid fa-arrow-trend-up me-2 text-muted"></i>
                                        {(artista.numBusquedas || 0).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLUMNA 4: Valoraciones y Comentarios */}
                <div className="stat-column d-flex flex-column gap-4">
                    {/* 4. VALORACIÓN */}
                    <div className="stat-card rating-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-thumbs-up"></i> Mejor Valorados</h2>
                        </div>
                        <div className="ranking-list">
                            {topValoracion.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="rank-item"
                                    onClick={() => handleNavigation(item.esAlbum ? 'album' : 'cancion', item)}
                                    style={clickableStyle}
                                >
                                    <div className="rank-pos-circle">{idx + 1}</div>
                                    <div className="rank-info">
                                        <span className="item-name">{item.titulo}</span>
                                        <span className="item-sub">
                                            {item.esAlbum ? 'Álbum' : 'Canción'}
                                        </span>
                                        <div className="progress-bar-bg">
                                            <div 
                                                className="progress-fill" 
                                                style={{
                                                    width: `${((item.sumaValoraciones || 0) / 5) * 100}%`,
                                                    maxWidth: '100%'
                                                }} 
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="rank-score-big">
                                        {item.sumaValoraciones || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="stat-column d-flex flex-column gap-4">
                    {/* 5. MÁS COMENTADOS */}
                    <div className="stat-card rating-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-comments"></i> Más Debatidos</h2>
                        </div>
                        <div className="ranking-list">
                            {topComentados.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="rank-item"
                                    onClick={() => handleNavigation(item.esAlbum ? 'album' : 'cancion', item)}
                                    style={clickableStyle}
                                >
                                    <div className="rank-pos-circle orange">{idx + 1}</div>
                                    <div className="rank-info">
                                        <span className="item-name">{item.titulo}</span>
                                        <span className="item-sub">
                                            {item.esAlbum ? 'Álbum' : 'Canción'}
                                        </span>
                                    </div>
                                    <div className="rank-metric">
                                        <i className="fa-regular fa-comment-dots me-2"></i>
                                        {(item.numComentarios || item.totalComentarios || 0).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================
                NUEVA SECCIÓN: TOP PERSONAL (Solo si logueado)
               ======================================================== */}
            {isLoggedIn && topPersonal.length > 0 && (
                <div className="personal-stats-section mt-5 fade-in">
                    <div className="card-header-stats" style={{ borderBottom: '2px solid #0dcaf0', paddingBottom: '10px' }}>
                        <h2><i className="fa-solid fa-heart-pulse me-2" style={{color: '#0dcaf0'}}></i> Tu Ritmo Musical</h2>
                        <span className="badge bg-info text-dark">Lo que más has escuchado</span>
                    </div>
                    
                    <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
                        {topPersonal.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="card personal-card text-white bg-dark mb-3" 
                                style={{ width: '18rem', cursor: 'pointer', border: '1px solid #333' }}
                                onClick={() => handleNavigation(item.esAlbum ? 'album' : 'cancion', item)}
                            >
                                <div className="row g-0 align-items-center">
                                    <div className="col-md-4 text-center">
                                        {/* Número de posición grande */}
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0dcaf0' }}>#{idx + 1}</div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="card-body">
                                            <h5 className="card-title text-truncate" title={item.titulo}>{item.titulo}</h5>
                                            <p className="card-text text-muted mb-1"><small>{item.artista}</small></p>
                                            <p className="card-text">
                                                <i className="fa-solid fa-play me-2 text-info"></i> 
                                                {/* Aquí 'segundosReproducidos' es en realidad el CONTEO de veces */}
                                                {item.segundosReproducidos} veces
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

export default Estadisticas;