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
    getTopArtistasBusquedas
} from '../../ApiServices/EstadisticasService';

import { getArtistaById } from '../../ApiServices/ArtistasService';
import { getElementoById } from '../../ApiServices/ElementosService';
import { registrarBusquedaArtista } from '../../ApiServices/EstadisticasService';
import { getComunidadById } from '../../ApiServices/ComunidadService';

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
    const [topBusquedas, setTopBusquedas] = useState([]); 

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

                // Hacemos lo mismo que arriba: convertir IDs en Nombres
                const rawBusquedas = topBusquedasData.data || topBusquedasData || [];
                if (rawBusquedas.length > 0) {
                    const promesasBusquedas = rawBusquedas.map(async (item) => {
                        const artistId = Number(item.idArtista); // Aseguramos que sea número
                        try {
                            // Reutilizamos el servicio de buscar por ID
                            const detalles = await getArtistaById(artistId);
                            return {
                                ...item,
                                nombreArtistico: detalles.nombreusuario || detalles.nombre || `Artista ${artistId}`
                            };
                        } catch (error) {
                            console.error(`Error cargando artista búsqueda ${artistId}`, error);
                            return { ...item, nombreArtistico: `Artista ${artistId}` };
                        }
                    });
                    setTopBusquedas(await Promise.all(promesasBusquedas));
                } else {
                    setTopBusquedas([]);
                }

                // --- C. HELPER PARA COMUNIDADES (NUEVO) ---
                const enriquecerComunidades = async (lista) => {
                    // 1. Ver qué lista bruta recibimos
                    const datosRaw = lista.data || lista || []; 

                    if (!datosRaw.length) return [];

                    const promesas = datosRaw.map(async (item) => {
                        try {

                            const detalle = await getComunidadById(item.idComunidad);            
                            // 3. ¡EL MÁS IMPORTANTE! Ver qué devolvió la API exactamente
                            console.log(`📦 Respuesta API para ID ${item.idComunidad}:`, detalle);

                            return {
                                ...item,
                                // Aquí veremos si coge el nombre o salta al fallback
                                nombre: detalle.nombreComunidad || `Comunidad ${item.idComunidad}`
                            };
                        } catch (error) {
                            console.error(`❌ Error peticionando comunidad ${item.idComunidad}:`, error);
                            return { ...item, nombre: `Comunidad ${item.idComunidad}` };
                        }
                    });

                    return await Promise.all(promesas);
                };

                // --- PROCESAR Y GUARDAR ESTADOS ---

                // 1. Procesamos Comunidades por Miembros
                setTopComunidades(await enriquecerComunidades(comunidadesMiembrosData));

                // 2. Procesamos Comunidades por Publicaciones
                setTopComunidadesPublis(await enriquecerComunidades(comunidadesPublisData));


                // --- PROCESAR RESTO DE LISTAS ---
                setTopVentas(await enriquecerContenido(ventasData));
                setTopValoracion(await enriquecerContenido(valoracionData));
                setTopComentados(await enriquecerContenido(comentariosData));

                // --- GUARDAR DATOS SIMPLES ---
                setTopGeneros(generosData.data || generosData || []);
                console.log("Top búsquedas:", topBusquedasData);


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

    const handleNavigation = async (tipo, item) => {
        
        // 1. Determinar el ID correcto. 
        // En estadísticas a veces viene como idContenido, idArtista o id.
        const id = item.idContenido || item.idArtista || item.id;
        
        console.log(`Navegando a ${tipo} con ID: ${id}`);

        let itemCompleto = item; // Por defecto usamos lo que tenemos

        // 2. Si es ÁLBUM o CANCIÓN, pedimos los datos completos (Igual que en ProductoCard)
        if (tipo === 'album' || tipo === 'cancion') {
            try {
                // Usamos el servicio getElementoById
                const dataDB = await getElementoById(token, id);
                
                if (dataDB) {
                    console.log("¡Datos completos recuperados!", dataDB);
                    itemCompleto = dataDB; // Reemplazamos con el objeto full de la BD
                }
            } catch (error) {
                console.error("Error al obtener detalles completos, usando básicos:", error);
                // Si falla, no pasa nada, seguimos con el item original
            }
        }

        // 3. Si es ARTISTA, registramos la búsqueda (Opcional, pero consistente con tu Catálogo)
        if (tipo === 'artista') {
            // Nota: Verifica si tienes esta función importada y si quieres contar esto como búsqueda
            registrarBusquedaArtista(token, id, idLoggedIn)
                .catch(err => console.error("Error registrando visita:", err));
        }

        // 4. Determinar la ruta exacta (Mapping de rutas)
        let ruta = '';
        if (tipo === 'album') ruta = '/masInfoAlbum';
        else if (tipo === 'cancion') ruta = '/masInfo'; // Para canciones es /masInfo a secas
        else if (tipo === 'artista') ruta = '/masInfoPerfil';

        // 5. Navegar pasando el itemCompleto en el state
        // Nota: Añadimos el ID a la URL también para que quede limpia (ej: /masInfo/5)
        // si tus rutas en App.js esperan parametro, si no, quita `/${id}`
        if (ruta) {
             // Si tus rutas en App.js son del tipo "/masInfo/:id", usa esta línea:
             navigate(`${ruta}`, { state: itemCompleto });
             
             // Si tus rutas son solo "/masInfo" y dependen 100% del state, usa esta:
             // navigate(ruta, { state: itemCompleto });
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
                                <li key={idx} className="community-item">
                                    <div className="com-rank">#{idx + 1}</div>
                                    <div className="com-details">
                                        {/* AQUI EL CAMBIO: Usamos com.nombre */}
                                        <strong className="text-truncate" >
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
                                <li key={idx} className="community-item">
                                    <div className="com-rank">#{idx + 1}</div>
                                    <div className="com-details">
                                        {/* AQUI EL CAMBIO: Usamos com.nombre */}
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
                                    // IMPORTANTE: Pasamos el ID del artista para navegar
                                    onClick={() => handleNavigation('artista', artista)}
                                    style={clickableStyle}
                                >
                                    {/* Círculo con el número de posición */}
                                    <div className="rank-pos-circle orange">{idx + 1}</div>
                                    
                                    <div className="rank-info">
                                        {/* Ahora sí pintamos el nombre del artista */}
                                        <span className="item-name">
                                            {artista.nombreArtistico}
                                        </span>
                                    </div>

                                    <div className="rank-metric">
                                        <i className="fa-solid fa-arrow-trend-up me-2 text-muted"></i>
                                        {/* Mostramos el número de búsquedas */}
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
        </div>
    );
}

export default Estadisticas;