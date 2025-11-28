import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Catalogo.css';
import { URL_MP3, CLOUD_URL_DEFAULT, URL_FOTO} from '../../config.js';
import { useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect, useContext } from 'react';
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga.js';

// --- NUEVOS IMPORTS ---
import { UsuarioContext } from '../InicioSesion/UsuarioContext';
import { getElementoById } from '../../ApiServices/ElementosService';

function Catalogo({ elementos, isLoading, artistas }) {
    const [menu, setMenu] = useState(0); // Utilizamos "menu" para gestionar el estado del menú
    const tipoPorMenu = menu === 1 ? 2 : menu === 2 ? 0 : menu === 3 ? 1 : null;
    const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda
    const [filtroGenero, setFiltroGenero] = useState('');
    const [filtroSubgenero, setFiltroSubgenero] = useState('');
    const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
    const [filtroPrecioMax, setFiltroPrecioMax] = useState('');
    const [filtroFechaMin, setFiltroFechaMin] = useState('');
    const [filtroFechaMax, setFiltroFechaMax] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);//Para mostrar los filtros o no.
    // const [subgenerosMap, setSubgenerosMap] = useState({});
    // const [subgenerosCargados, setSubgenerosCargados] = useState(false);

    // 4. Filtrado corregido - versión definitiva
    //const subgenerosUnicos = [...new Set(elementos.map(item => item.subgenero.nombre))];
    const generosUnicos = [...new Set(elementos.map(item => item.genero.nombre))];
    //console.log(elementos);
    const productosFiltrados = elementos.filter(item => {
        const nombreGenero = item.genero.nombre;
        const cumpleBusqueda = busqueda ? item.nombre.toLowerCase().includes(busqueda.toLowerCase()) : true;
        //const cumpleGenero = filtroGenero ? item.genero === filtroGenero : true;
        const cumpleGenero = filtroGenero ? nombreGenero === filtroGenero : true;
        //const cumpleSubgenero = filtroSubgenero ? item.subgenero === filtroSubgenero : true;
        const cumplePrecio = (!filtroPrecioMin || item.precio >= filtroPrecioMin) &&
            (!filtroPrecioMax || item.precio <= filtroPrecioMax);

        // Convertir la fecha del producto a objeto Date
        const fechaProducto = convertirFechaISO(item.fechacrea);

        // Convertir las fechas de filtro a objeto Date (si están definidas)
        const fechaMin = filtroFechaMin ? new Date(filtroFechaMin) : null;
        const fechaMax = filtroFechaMax ? new Date(filtroFechaMax) : null;

        const cumpleFecha = (!fechaMin || (fechaProducto && fechaProducto >= fechaMin)) &&
            (!fechaMax || (fechaProducto && fechaProducto <= fechaMax));

        const cumpleElemento = tipoPorMenu !== null ? item.tipo === tipoPorMenu : true;
        return cumpleBusqueda && cumplePrecio && cumpleFecha && cumpleElemento && cumpleGenero; // && cumpleSubgenero;
    });

    const categorias = [
        { title: "Novedades", items: productosFiltrados.filter(item => item.esNovedad === true), },
        { title: "Artistas", items: productosFiltrados.filter(item => item.tipo === 0) },
        { title: "Canciones", items: productosFiltrados.filter(item => item.tipo === 2) },
        { title: "Álbumes", items: productosFiltrados.filter(item => item.tipo === 1) },
    ];

    return (
        <div id='catalogo-container'>
            {isLoading ? <PantallaCarga /> : null}
            
            <h1 className="text-center mb-4" style={{color: '#333'}}>Catálogo de productos</h1>
            
            <div id='menuCatalogo'>
                <nav className="navbar navbar-expand-lg pb-0 bg-white shadow-sm rounded mb-4">
                    {/* CONTENEDOR FLEX: Botón Izquierda | Menú Derecha */}
                    <div className="container-fluid d-flex justify-content-between align-items-center">
                        
                        {/* --- BOTÓN ESTADÍSTICAS (IZQUIERDA) --- */}
                        <div className="d-flex align-items-center">
                            <button 
                                className="btn-estadisticas"
                                onClick={() => navigate('/estadisticas')}
                            >
                                <i className="fa-solid fa-chart-simple me-2"></i>
                                <span className="d-none d-md-inline">Estadísticas</span>
                            </button>
                        </div>

                        {/* --- MENÚ HAMBURGUESA (Móvil) --- */}
                        <button className="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        
                        {/* --- MENÚ DERECHO --- */}
                        <div className="collapse navbar-collapse flex-grow-0" id="navbarText">
                            <ul className="navbar-nav mb-2 mb-lg-0 me-3">
                                <li className={`nav-link ${menu === 0 ? "menuCatalogoActivo" : ""}`} onClick={() => setMenu(0)}>
                                    <a className="nav-link">Explorar</a>
                                </li>
                                <li className={`nav-link ${menu === 1 ? "menuCatalogoActivo" : ""}`} onClick={() => setMenu(1)}>
                                    <a className="nav-link">Canciones</a>
                                </li>
                                <li className={`nav-link ${menu === 2 ? "menuCatalogoActivo" : ""}`} onClick={() => setMenu(2)}>
                                    <a className="nav-link">Artistas</a>
                                </li>
                                <li className={`nav-link ${menu === 3 ? "menuCatalogoActivo" : ""}`} onClick={() => setMenu(3)}>
                                    <a className="nav-link">Álbumes</a>
                                </li>
                            </ul>
                            
                            <div className="d-flex align-items-center gap-3">
                                <i className="fa-solid fa-bars-staggered" onClick={() => setMostrarFiltros(!mostrarFiltros)} style={{cursor:'pointer', color: '#572363', fontSize: '1.2rem'}}></i>
                                
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    style={{maxWidth: '200px', borderRadius: '20px'}}
                                />
                            </div>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Filtros */}
            <div className={`${mostrarFiltros ? "" : "d-none"} d-flex justify-content-center gap-3 mb-4 flex-wrap mt-3 bg-white p-3 rounded shadow-sm`}>
                <DropdownFilter
                    label={filtroGenero || 'Selecciona un género'}
                    options={generosUnicos}
                    onSelect={setFiltroGenero}
                />
                <input type="number" className="form-control" placeholder="Precio mín" value={filtroPrecioMin} onChange={(e) => setFiltroPrecioMin(e.target.value)} style={{width: '120px'}} />
                <input type="number" className="form-control" placeholder="Precio máx" value={filtroPrecioMax} onChange={(e) => setFiltroPrecioMax(e.target.value)} style={{width: '120px'}} />
                <input type="date" className="form-control" value={filtroFechaMin || ""} onChange={(e) => setFiltroFechaMin(e.target.value)} style={{width: 'auto'}} />
                <input type="date" className="form-control" value={filtroFechaMax || ""} onChange={(e) => setFiltroFechaMax(e.target.value)} style={{width: 'auto'}} />
            </div>

            {/* Secciones con Estilo de Caja Gris */}
            {categorias.map((categoria, index) => (
                <Section key={index} title={categoria.title} items={categoria.items} />
            ))}
        </div>
    );
}

// --- COMPONENTES AUXILIARES (Mantenidos) ---

function DropdownFilter({ label, options, onSelect }) {
    return (
        <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                {label}
            </button>
            <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#" onClick={() => onSelect('')}>Todos</a></li>
                {options.map((option, index) => (
                    <li key={index}><a className="dropdown-item" href="#" onClick={() => onSelect(option)}>{option}</a></li>
                ))}
            </ul>
        </div>
    );
}

const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
        <i key={i} className={i < rating ? "bi bi-file-music-fill text-warning" : "bi bi-file-music text-muted"} style={{marginRight: '2px'}} />
    ));
};

const convertirFechaISO = (fechaISO) => {
  if (!fechaISO) return null;
  return new Date(fechaISO);
};


// Sección con Slider Horizontal
function Section({ title, items }) {
    if (items.length === 0) return null;
    return (
        <div className='seccion-gris'>
            <div className="titulo-seccion-container">
                <h2 className="titulo-seccion">{title}</h2>
            </div>
            <div className="slider-container">
                <div className="slider">
                    {items.map((item, index) => <ProductoCard key={index} item={item} />)}
                </div>
            </div>
        </div>
    );
}

function ProductoCard({ item }) {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false); 
    const [showModal, setShowModal] = useState(false); 
    const [showSharePopup, setShowSharePopup] = useState(false);

    const { token } = useContext(UsuarioContext);
    const togglePlay = () => setIsPlaying(prev => !prev);

    // Función para abrir el pop-up de reproducción
    const handlePlayClick = () => {
        if (item.tipo === 1 || item.tipo === 2) {
            setShowModal(true);
        }
    };

    /*// Esta función navega a /masInfo y pasa el objeto item a través del state (userState)
    const handleClick = () => {
        console.log("item completo:", item);

        if (item.tipo === 1) {
            navigate("/masInfoAlbum", { state: item });
        }
        else if (item.tipo === 2) {
            navigate("/masInfo", { state: item });
        }
        else if (item.tipo === 0) {
            navigate("/masInfoPerfil", { state: item });
        }
    };*/

    // --- NUEVO HANDLECLICK ASÍNCRONO ---
    const handleClick = async () => {
        console.log("Iniciando carga de detalle para:", item.nombre);
        
        let itemCompleto = item; // Por defecto usamos lo que ya tenemos

        // Si es Álbum (1) o Canción (2), pedimos el objeto completo a la BD
        if (item.tipo === 1 || item.tipo === 2) {
            try {
                // Aquí hacemos la magia: Fetch antes de navegar
                const dataDB = await getElementoById(token, item.id);
                
                if (dataDB) {
                    console.log("¡Datos completos recuperados!", dataDB);
                    itemCompleto = dataDB; // Sustituimos el item básico por el completo
                    console.log("Dato enviado", itemCompleto);
                }
            } catch (error) {
                console.error("Error al obtener detalles completos, usando básicos:", error);
                // Si falla, seguimos usando 'item' original para no bloquear al usuario
            }
        }

        // Navegamos con el itemCompleto (que ya trae artista, genero, etc.)
        if (item.tipo === 1) {
            navigate("/masInfoAlbum", { state: itemCompleto });
        }
        else if (item.tipo === 2) {
            navigate("/masInfo", { state: itemCompleto });
        }
        else if (item.tipo === 0) {
            navigate("/masInfoPerfil", { state: item });
        }
    };
    const shareWith = () => { setShowSharePopup(true); };
    const handleCopyLink = () => {
        let link = `${window.location.origin}`;
        if (item.tipo === 2) link += "/masInfo";
        else if (item.tipo === 1) link += "/masInfoAlbum";
        navigator.clipboard.writeText(link).then(() => alert("Link copiado!")).catch(() => alert("Error copiar link"));
    };
    const closeModal = () => { setShowModal(false); setIsPlaying(false); };
    const getImageClass = () => {
        switch (item.tipo) {
            case 1: return 'card-img-rounded'; 
            case 2: return 'card-img-square'; 
            case 3: return 'card-img-circle'; 
            default: return 'card-img-rounded'; 
        }
    };
    
    return (
        <div>
            <div className="card-catalogo">
                <div className="card-icons">
                    <i className="fa-solid fa-plus" onClick={handleClick}></i>
                    {showSharePopup && (
                        <div className="modal-overlay">
                            <div className="share-popup bg-white p-3 rounded shadow">
                                <p>Comparte este enlace:</p>
                                <input type="text" value={item.tipo === 2 ? `${window.location.origin}/masInfo` : item.tipo === 1 ? `${window.location.origin}/masInfoAlbum` : window.location.origin} readOnly className="form-control mb-2" />
                                <button className="btn btn-sm btn-primary w-100" onClick={handleCopyLink}>Copiar</button>
                                <span className="close-button text-dark" onClick={() => setShowSharePopup(false)}>&times;</span>
                            </div>
                        </div>
                    )}
                    <i className="fa-solid fa-share-nodes" onClick={shareWith}></i>
                </div>
                {<img
                    src={
                        item.fotoamazon && item.fotoamazon !== "null"
                            ? `${URL_FOTO}${item.fotoamazon}`
                            : `${CLOUD_URL_DEFAULT}`
                    }
                    className={`card-img-top ${getImageClass()}`}
                    alt={item.nombre}
                />}
                <div className="card-body">
                    <h5>{item.nombre}</h5>
                    {item.genero?.nombre ? <span className="tags-genero me-2 mb-3">{item.genero.nombre}</span> : <h6 style={{ fontStyle: "italic", color: "gray", fontSize: '0.8rem' }}>Sin género</h6>}
                    <div className="info-container mt-2">
                        {item.tipo === 2 && <div><p className="precio">{item.precio}€</p><i className="fa-regular fa-circle-play fa-2x text-primary my-2" onClick={handlePlayClick} style={{cursor: 'pointer'}}></i><div className="left-info">{renderStars(item.valoracion)}</div></div>}
                        {item.tipo === 1 && <div><p className="precio">{item.precio}€</p><div className="left-info">{renderStars(item.valoracion)}</div></div>}
                        {item.tipo === 0 && <div className="artista-info"><div className="left-info">{renderStars(item.valoracion)}</div></div>}
                    </div>
                </div>
            </div>
            <div>{showModal && <Popup closeModal={closeModal} item={item} togglePlay={togglePlay} isPlaying={isPlaying} />}</div>
        </div>
    );
}

function Popup({ closeModal, item, togglePlay, isPlaying }) {
    const [girar, setGirar] = useState(false);
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return; 
        if (isPlaying) { audio.play().catch(e => console.log(e)); setGirar(true); } 
        else { audio.pause(); setGirar(false); }
    }, [isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const updateTime = () => { setCurrentTime(audio.currentTime); setDuration(audio.duration || 0); };
        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateTime);
        return () => { audio.removeEventListener("timeupdate", updateTime); audio.removeEventListener("loadedmetadata", updateTime); };
    }, []);

    const handleBackwardClick = () => { if (audioRef.current) { const t = Math.max(audioRef.current.currentTime - 10, 0); audioRef.current.currentTime = t; setCurrentTime(t); }};
    const handleForwardClick = () => { if (audioRef.current) { const t = Math.min(audioRef.current.currentTime + 10, duration); audioRef.current.currentTime = t; setCurrentTime(t); }};
    const formatTime = (time) => { const m = Math.floor(time / 60); const s = Math.floor(time % 60); return `${m}:${s < 10 ? "0" : ""}${s}`; };
    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = (x / rect.width) * duration;
        if (audio && !isNaN(newTime)) { audio.currentTime = newTime; setCurrentTime(newTime); }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <span className="close-button" onClick={closeModal}>&times;</span>
                <img
                    src={
                        item.fotoamazon && item.fotoamazon !== "null"
                            ? `${URL_FOTO}${item.fotoamazon}`
                            : `${CLOUD_URL_DEFAULT}`
                    }
                    className="modal-img"
                    alt={item.nombre}
                    style={{
                        animation: "rotar 7s linear infinite",
                        animationPlayState: girar ? "running" : "paused"
                    }}
                />

                <h2>{item.nombre}</h2>
                {/* <h3>{item.nombre}</h3> */}

                {item.tipo === 2 && ( //si es canción
                    <audio ref={audioRef}
                        src={`${URL_MP3}${item.fotoamazon.replace(/\.[^/.]+$/, "")}.mp3`}/>
                )}

                {/* Controles de reproducción */}
                <div className="player-controls">
                    <div className='alineacion-botones'>
                        <i className="fa-solid fa-backward" onClick={handleBackwardClick}></i>
                        <button onClick={togglePlay}>{isPlaying ? <i className="fa-solid fa-pause"></i> : <i className="fa-solid fa-play"></i>}</button>
                        <i className="fa-solid fa-forward" onClick={handleForwardClick}></i>
                    </div>
                    <div className="tiempo-Barra">
                        <div className='tiempoTranscurrido'>{formatTime(currentTime)}</div>
                        <div className="progress" onClick={handleProgressClick}><div className="progreso" style={{ width: `${(currentTime / duration) * 100}%` }}></div></div>
                        <div className='tiempoTotal'>{formatTime(duration)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Catalogo;