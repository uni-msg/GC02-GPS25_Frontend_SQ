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
    getRankingComunidadesPublicaciones
} from '../../ApiServices/EstadisticasService';

import { getArtistaById } from '../../ApiServices/ArtistasService';
import { getElementoById } from '../../ApiServices/ElementosService';
import { registrarBusquedaArtista } from '../../ApiServices/EstadisticasService';

import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga';
import './Estadisticas.css';

function Estadisticas() {
    const { token, idLoggedIn } = useContext(UsuarioContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 
    
    // Estados para los distintos rankings
    const [topArtistas, setTopArtistas] = useState([]);
    const [topVentas, setTopVentas] = useState([]);
    const [topGeneros, setTopGeneros] = useState([]);
    const [topComunidades, setTopComunidades] = useState([]);      
    const [topComunidadesPublis, setTopComunidadesPublis] = useState([]); 
    const [topValoracion, setTopValoracion] = useState([]);
    const [topComentados, setTopComentados] = useState([]);        

    useEffect(() => {
        const cargarDatos = async () => {
            console.log("--- 1. INICIANDO CARGA ---");
            setLoading(true);

            try {
                // 1. Artistas
                const artistasData = await getRankingArtistasOyentes(); 
                console.log("--- 1. DATOS ARTISTAS CARGADOS ---");
                console.log(artistasData);

                // 2. Resto de llamadas
                const [
                    ventasData, generosData, comunidadesMiembrosData, 
                    valoracionData, comentariosData, comunidadesPublisData 
                ] = await Promise.all([
                    getTopContenidosVentas(),
                    getTopGeneros(),
                    getRankingComunidadesMiembros(),
                    getTopContenidosValoracion(),
                    getTopContenidosComentarios(),      
                    getRankingComunidadesPublicaciones() 
                ]);


                    // --- PROCESAR ARTISTAS (BLOQUE CORREGIDO) ---
                    if (artistasData.length > 0) {
                        const promesas = artistasData.map(async (artistaBD) => {

                    // Convertimos el ID con un nombre claro
                    const artistId = Number(artistaBD.idArtista);

                    // Llamamos al backend
                    try {
                        console.log(`🔍 Consultando detalles para el artista con ID: ${artistId}`);

                        const detalles = await getArtistaById(artistId);

                        return {
                            ...artistaBD,
                            nombreArtistico:
                                detalles.nombreusuario ||
                                detalles.nombre ||
                                `Artista ${artistId}`
                        };

                    } catch (error) {
                        console.error(`❌ Error consultando ID ${artistId}`, error);

                        return {
                            ...artistaBD,
                            nombreArtistico: `Artista ${artistId}`
                        };
                    }
                });

                    setTopArtistas(await Promise.all(promesas));
                }

                // --- HELPER PARA ENRIQUECER CONTENIDOS ---
                const enriquecerContenido = async (lista) => {
                    if (!lista || lista.length === 0) return [];
                    const promesas = lista.map(async (item) => {
                        try {
                            const detalle = await getElementoById(token, item.idContenido);
                            
                            // --- CORRECCIÓN AQUÍ ---
                            // Verificamos si 'detalle.artista' es un objeto y sacamos el nombre
                            let nombreDelArtista = null;

                            if (detalle.nombreArtista) {
                                nombreDelArtista = detalle.nombreArtista; // Si ya viene el texto plano
                            } else if (detalle.artista && typeof detalle.artista === 'object') {
                                // Si es un objeto, sacamos el nombreusuario o nombreArtistico
                                nombreDelArtista = detalle.artista.nombreArtistico || detalle.artista.nombreusuario || "Artista Desconocido";
                            } else if (typeof detalle.artista === 'string') {
                                nombreDelArtista = detalle.artista;
                            }
                            // -----------------------

                            return {
                                ...item,
                                titulo: detalle.nombre || detalle.nombreAudio || detalle.titulo || `Elemento ${item.idContenido}`,
                                artista: nombreDelArtista // Ahora seguro que es un texto o null
                            };
                        } catch (error) {
                            return { ...item, titulo: `Contenido ID ${item.idContenido} (Sin info)` };
                        }
                    });
                    return await Promise.all(promesas);
                };
                // --- PROCESAR RESTO DE LISTAS ---
                setTopVentas(await enriquecerContenido(ventasData));
                setTopValoracion(await enriquecerContenido(valoracionData));
                setTopComentados(await enriquecerContenido(comentariosData));

                // --- GUARDAR DATOS SIMPLES ---
                setTopGeneros(generosData.data || generosData || []);
                setTopComunidades(comunidadesMiembrosData.data || comunidadesMiembrosData || []);
                setTopComunidadesPublis(comunidadesPublisData.data || comunidadesPublisData || []);

            } catch (error) {
                console.error("ERROR EN ESTADÍSTICAS:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [token]);

    // ---------------------------------------------------------
    //  AQUÍ ESTÁ LA MAGIA DE LA NAVEGACIÓN SEGÚN TUS RUTAS
    // ---------------------------------------------------------
    const handleNavigation = (tipo, id) => {
        console.log(`Navegando a ${tipo} con ID: ${id}`);
        
        if (tipo === 'artista') {
            // Ruta definida en tu index.js: <Route path="masInfoPerfil" ... />
            console.log(`Registrando visita estadísticas: Artista ${id}, Usuario ${idLoggedIn}`);
            registrarBusquedaArtista(token, id, idLoggedIn)
                .catch(err => console.error("Error background stats:", err));
            navigate('/masInfoPerfil', { state: { id: id, idArtista: id } }); 
        } 
        else if (tipo === 'album') {
            // Ruta definida en tu index.js: <Route path="masInfoAlbum" ... />
            navigate('/masInfoAlbum', { state: { id: id } });
        } 
        else if (tipo === 'cancion') {
            // Ruta definida en tu index.js: <Route path="masInfo" ... />
            navigate('/masInfo', { state: { id: id } });
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
                        {topArtistas.slice(0, 5).map((artista, idx) => (
                            <div 
                                key={idx} 
                                className={`rank-item rank-${idx + 1}`}
                                onClick={() => handleNavigation('artista', artista.nombreArtistico)}
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
                                onClick={() => handleNavigation(item.esAlbum ? 'album' : 'cancion', item.idContenido)}
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
                                <li key={idx} className="community-item">
                                    <div className="com-rank">#{idx + 1}</div>
                                    <div className="com-details">
                                        <strong>ID: {com.idComunidad}</strong>
                                        <small>{(com.numMiembros || 0).toLocaleString()} Miembros</small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Comunidades (Publicaciones) */}
                    <div className="stat-card small-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-pen-to-square"></i> Más Activas</h2>
                        </div>
                        <ul className="community-list">
                            {topComunidadesPublis.slice(0, 3).map((com, idx) => (
                                <li key={idx} className="community-item">
                                    <div className="com-rank">#{idx + 1}</div>
                                    <div className="com-details">
                                        <strong>ID: {com.idComunidad}</strong>
                                        <small>
                                            {(com.numPublicaciones || com.totalPublicaciones || 0).toLocaleString()} Publicaciones
                                        </small> 
                                    </div>
                                </li>
                            ))}
                        </ul>
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
                                    onClick={() => handleNavigation(item.esAlbum ? 'album' : 'cancion', item.idContenido)}
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
                                    onClick={() => handleNavigation(item.esAlbum ? 'album' : 'cancion', item.idContenido)}
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
        </div>
    );
}

export default Estadisticas;