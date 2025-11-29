import React, { useState, useEffect, useContext } from 'react';
import { UsuarioContext } from "../InicioSesion/UsuarioContext";
import { 
    getRankingArtistasOyentes, 
    getTopContenidosVentas, 
    getTopGeneros, 
    getRankingComunidadesMiembros,
    getTopContenidosValoracion
} from '../../ApiServices/EstadisticasService';
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga';
import './Estadisticas.css';

function Estadisticas() {
    const { token } = useContext(UsuarioContext);
    const [loading, setLoading] = useState(true);
    
    // Estados para los distintos rankings
    const [topArtistas, setTopArtistas] = useState([]);
    const [topVentas, setTopVentas] = useState([]);
    const [topGeneros, setTopGeneros] = useState([]);
    const [topComunidades, setTopComunidades] = useState([]);
    const [topValoracion, setTopValoracion] = useState([]);
    

useEffect(() => {
        const cargarDatos = async () => {
            console.log("--- 1. INICIANDO CARGA (SIN TOKEN) ---");
            setLoading(true);

            try {
                // Hacemos las llamadas SIN .catch individual. Si una falla, queremos que explote aquí.
                
                // 1. Probamos solo UNA llamada primero para ver si hay vida
                console.log("--- 2. Intentando obtener artistas... ---");
                const artistasData = await getRankingArtistasOyentes(); 
                console.log("--- 3. Artistas recibidos: ", artistasData);

                // 2. Si la de arriba pasa, intentamos el resto
                const [ventasData, generosData, comunidadesData, valoracionData] = await Promise.all([
                    getTopContenidosVentas(5),
                    getTopGeneros(5),
                    getRankingComunidadesMiembros(),
                    getTopContenidosValoracion(5)
                ]);
                console.log("👀 ESTRUCTURA DE COMUNIDADES:", comunidadesData);

                // Versión segura si todo tu backend usa ese formato de respuesta {status, data}:
                setTopArtistas(artistasData || []); // Este ya vimos que es un array directo
                setTopVentas(ventasData.data || ventasData || []);
                setTopGeneros(generosData.data || generosData || []);
                setTopComunidades(comunidadesData.data || comunidadesData || []);
                setTopValoracion(valoracionData.data || valoracionData || []);

            } catch (error) {
                // AQUI ES DONDE VEREMOS POR QUÉ NO LLAMA
                console.error("💀 ERROR FATAL EN EL COMPONENTE:", error);
                
                if (error.code === "ERR_NETWORK") {
                    console.error("POSIBLE CAUSA: El Backend está apagado o es un problema de CORS.");
                }
                if (error.response && error.response.status === 404) {
                    console.error("POSIBLE CAUSA: La URL está mal escrita en EstadisticasService.");
                }
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []); // Array vacío, solo se ejecuta al montar

    if (loading) {
        return <PantallaCarga mensaje="Analizando el mercado musical..." />;
    }

    // Iconos para el podio (Oro, Plata, Bronce)
    const renderRankIcon = (index) => {
        if (index === 0) return <i className="fa-solid fa-trophy rank-gold"></i>;
        if (index === 1) return <i className="fa-solid fa-trophy rank-silver"></i>;
        if (index === 2) return <i className="fa-solid fa-trophy rank-bronze"></i>;
        return <span className="rank-number">#{index + 1}</span>;
    };

    return (
        <div className="estadisticas-container fade-in">
            <h1 className="main-title">
                <i className="fa-solid fa-chart-simple me-3"></i>
                Centro de Estadísticas
            </h1>
            <p className="subtitle">Rankings Globales y Tendencias del Mercado</p>

            <div className="stats-grid">
                
                {/* TARJETA 1: Top Artistas */}
                <div className="stat-card artist-card">
                    <div className="card-header-stats">
                        <h2><i className="fa-solid fa-microphone-lines"></i> Artistas Top</h2>
                        <span className="badge-stats">Mensual</span>
                    </div>
                    <div className="ranking-list">
                        {topArtistas.slice(0, 5).map((artista, idx) => (
                            <div key={idx} className={`rank-item rank-${idx + 1}`}>
                                <div className="rank-pos">{renderRankIcon(idx)}</div>
                                <div className="rank-info">
                                    <span className="item-name">Artista ID: {artista.idArtista}</span>
                                    <span className="item-sub">
                                        <i className="fa-solid fa-headphones"></i> {artista.numOyentes ? artista.numOyentes.toLocaleString() : 0} Oyentes
                                    </span>
                                </div>
                                <div className="rank-score">
                                    <i className="fa-solid fa-star text-warning"></i> {artista.valoracionMedia}
                                </div>
                            </div>
                        ))}
                        {topArtistas.length === 0 && <p className="text-muted text-center mt-3">No hay datos disponibles.</p>}
                    </div>
                </div>

                {/* TARJETA 2: Más Vendidos */}
                <div className="stat-card sales-card">
                    <div className="card-header-stats">
                        <h2><i className="fa-solid fa-cart-shopping"></i> Top Ventas</h2>
                        <span className="badge-stats">Global</span>
                    </div>
                    <div className="ranking-list">
                        {topVentas.map((item, idx) => (
                            <div key={idx} className="rank-item">
                                <div className="rank-pos">{renderRankIcon(idx)}</div>
                                <div className="rank-info">
                                    <span className="item-name">Contenido ID: {item.idContenido}</span>
                                    <span className="item-sub type-badge">
                                        {item.esAlbum ? 'Álbum' : 'Single'}
                                    </span>
                                </div>
                                <div className="rank-metric">
                                    {item.numVentas} <small>Ventas</small>
                                </div>
                            </div>
                        ))}
                        {topVentas.length === 0 && <p className="text-muted text-center mt-3">No hay datos disponibles.</p>}
                    </div>
                </div>

                {/* COLUMNA 3: Géneros y Comunidades */}
                <div className="stat-column d-flex flex-column gap-4">
                    
                    {/* Géneros */}
                    <div className="stat-card small-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-music"></i> Géneros Tendencia</h2>
                        </div>
                        <div className="genre-cloud">
                            {topGeneros.map((gen, idx) => (
                                <div key={idx} className="genre-tag" style={{fontSize: `${1 + (5-idx)*0.1}rem`}}>
                                    {gen.genero}
                                    <span className="genre-count">{gen.totalVentas}</span>
                                </div>
                            ))}
                            {topGeneros.length === 0 && <p className="text-muted text-center">Sin datos.</p>}
                        </div>
                    </div>

                    {/* Comunidades */}
                    <div className="stat-card small-card">
                        <div className="card-header-stats">
                            <h2><i className="fa-solid fa-users"></i> Comunidades Activas</h2>
                        </div>
                        <ul className="community-list">
                            {topComunidades.slice(0, 5).map((com, idx) => (
                                <li key={idx} className="community-item">
                                    <div className="com-rank">#{idx + 1}</div>
                                    <div className="com-details">
                                        <strong>Comunidad ID: {com.idComunidad}</strong>
                                        <small>{com.numMiembros} Miembros • {com.numPublicaciones} Posts</small>
                                    </div>
                                </li>
                            ))}
                            {topComunidades.length === 0 && <p className="text-muted text-center">Sin datos.</p>}
                        </ul>
                    </div>
                </div>

                {/* TARJETA 4: Top Valoración */}
                <div className="stat-card rating-card">
                    <div className="card-header-stats">
                        <h2><i className="fa-solid fa-thumbs-up"></i> Mejor Valorados</h2>
                    </div>
                    <div className="ranking-list">
                        {topValoracion.map((item, idx) => (
                            <div key={idx} className="rank-item">
                                <div className="rank-pos-circle">{idx + 1}</div>
                                <div className="rank-info">
                                    <span className="item-name">ID: {item.idContenido}</span>
                                    <div className="progress-bar-bg">
                                        {/* Barra de progreso visual */}
                                        <div 
                                            className="progress-fill" 
                                            style={{width: `${(item.sumaValoraciones / 50) * 100}%`, maxWidth: '100%'}} 
                                        ></div>
                                    </div>
                                </div>
                                <div className="rank-score-big">
                                    {item.sumaValoraciones}
                                </div>
                            </div>
                        ))}
                        {topValoracion.length === 0 && <p className="text-muted text-center mt-3">No hay datos disponibles.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Estadisticas;