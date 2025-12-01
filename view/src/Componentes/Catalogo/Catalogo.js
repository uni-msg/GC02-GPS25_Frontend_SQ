import './Catalogo.css';
import { URL_MP3, CLOUD_URL_DEFAULT, URL_FOTO} from '../../config.js';
import { useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect, useContext } from 'react';
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga.js';
import Estadisticas from '../Estadisticas/Estadisticas';
import Comunidades from '../Comunidad/Comunidad';
// --- NUEVOS IMPORTS ---
import { UsuarioContext } from '../InicioSesion/UsuarioContext';
import { getElementoById } from '../../ApiServices/ElementosService';
import { registrarBusquedaArtista, registrarReproduccion } from '../../ApiServices/EstadisticasService.js';

function Catalogo({ elementos, isLoading, artistas }) {
    const [menu, setMenu] = useState(() => {
        const menuGuardado = sessionStorage.getItem('catalogo_menu_activo');
        return menuGuardado !== null ? Number(menuGuardado) : 0;
    });
    useEffect(() => {
        sessionStorage.setItem('catalogo_menu_activo', menu);
    }, [menu]);
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
            {isLoading ? (
                <PantallaCarga />
            ) : (
                <>
                    {/* <div id='menuCatalogo'>
                    {elementos.map((e, i) => (
                    <div key={i}>{e.nombre}</div>
                    ))}
                </div> */}
                
                </>
            )}
            <h1 className="text-center mb-4">Catálogo de productos</h1>
            <div id='menuCatalogo' >
                <nav className="navbar navbar-expand-lg pb-0">
                    <div className="container-fluid justify-content-end">
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarText">
                            <ul className="navbar-nav mb-2 mb-lg-0 me-auto">
                                <li
                                    className={`nav-link ${menu === 0 ? "menuCatalogoActivo" : ""}`}
                                    onClick={() => {
                                        setMenu(0);
                                    }}
                                >
                                    <a className="nav-link">Explorar</a>
                                </li>
                                <li
                                    className={`nav-link ${menu === 1 ? "menuCatalogoActivo" : ""}`}
                                    onClick={() => {
                                        setMenu(1);
                                    }}
                                >
                                    <a className="nav-link">Canciones</a>
                                </li>
                                <li
                                    className={`nav-link ${menu === 2 ? "menuCatalogoActivo" : ""}`}
                                    onClick={() => {
                                        setMenu(2);
                                    }}
                                >
                                    <a className="nav-link">Artistas</a>
                                </li>
                                <li
                                    className={`nav-link  ${menu === 3 ? "menuCatalogoActivo" : ""}`}
                                    onClick={() => {
                                        setMenu(3);
                                    }}
                                >
                                    <a className="nav-link">Álbumes</a>
                                </li>
                                <li className={`nav-link ${menu === 4 ? "menuCatalogoActivo" : ""}`} onClick={() => setMenu(4)}>
                                    <a className="nav-link">Estadísticas</a>
                                </li>
                                <li className={`nav-link ${menu === 5 ? "menuCatalogoActivo" : ""}`} onClick={() => setMenu(5)}>
                                    <a className="nav-link">Comunidades</a>
                                </li>
                            </ul>
                            <div className="text-end pe-3">
                                <i className="fa-solid fa-bars-staggered" onClick={() => setMostrarFiltros(!mostrarFiltros)}></i>
                            </div>
                            {/* Barra de búsqueda */}
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)} // Actualiza el estado con lo que el usuario escribe
                            />
                        </div>
                    </div>
                </nav>
            </div>

            {/* Filtros */}
            <div className={`${mostrarFiltros ? "" : "filtros-ocultos"} d-flex justify-content-center gap-3 mb-4`}>
                <DropdownFilter
                    label={filtroGenero || 'Selecciona un género'}
                    options={generosUnicos}
                    onSelect={setFiltroGenero}
                />
                {/*<DropdownFilter
                    label={filtroSubgenero || 'Selecciona un subgénero'}
                    options={subgenerosUnicos}
                    onSelect={setFiltroSubgenero}
                />*/}

                {/* Filtro por Precio */}
                <input
                    type="number"
                    className="form-control"
                    placeholder="Precio mínimo"
                    value={filtroPrecioMin}
                    onChange={(e) => setFiltroPrecioMin(e.target.value)}
                />
                <input
                    type="number"
                    className="form-control"
                    placeholder="Precio máximo"
                    value={filtroPrecioMax}
                    onChange={(e) => setFiltroPrecioMax(e.target.value)}
                />

                {/* Filtro por Fecha */}
                <input
                    type="date"
                    className="form-control"
                    value={filtroFechaMin || ""}
                    onChange={(e) => setFiltroFechaMin(e.target.value)}
                />

                <input
                    type="date"
                    className="form-control"
                    value={filtroFechaMax || ""}
                    onChange={(e) => setFiltroFechaMax(e.target.value)}
                />
            </div>

            {menu === 4 ? (
                <div className="seccion-estadisticas mt-4">
                    <Estadisticas />
                </div>
            ) : menu === 5 ? (
                <div className="seccion-comunidades mt-5">
                    <Comunidades />
                </div>
            ) : (
                categorias.map((categoria, index) => (
                    <Section key={index} title={categoria.title} items={categoria.items} />
                ))
            )}

        </div>
    );
}

// Componente Dropdown para filtros
function DropdownFilter({ label, options, onSelect }) {
    return (
        <div className="dropdown">
            <button className="btn filtro-btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
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
        <i
            key={i}
            className={
                i < rating
                    ? "bi bi-file-music-fill text-info my-icon" // Icono lleno
                    : "bi bi-file-music text-info my-icon"      // Icono vacío
            }
        />
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
        <div className='categoria'>
            <h2>{title}</h2>
            <div className="slider-container">
                <div className="slider">
                    {items.map((item, index) => (
                        <ProductoCard key={index} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Tarjeta de Producto
function ProductoCard({ item }) {
    const navigate = useNavigate();
    
    const [isPlaying, setIsPlaying] = useState(false); // Estado para simular play/pause
    const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal
    const [showSharePopup, setShowSharePopup] = useState(false);
    //const userState = useNavigate.state || {};

    const { token, idLoggedIn } = useContext(UsuarioContext);
    const idUsuarioActual = idLoggedIn;
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
            registrarBusquedaArtista(token, item.id, idLoggedIn).catch(err => console.error(err));
            navigate("/masInfoPerfil", { state: item.id });
            console.log("Dato enviado", {state: item.id});
        }
    };

    // Función para botones pop-up
    const shareWith = () => { setShowSharePopup(true); };
    const handleCopyLink = () => {
        let link = `${window.location.origin}`;

        if (item.tipo === 2) {
            link += "/masInfo";
        } else if (item.tipo === 1) {
            link += "/masInfoAlbum";
        }
        navigator.clipboard.writeText(link).then(() => {
            alert("Link copiado al portapapeles!");
        }).catch(() => {
            alert("Error al copiar el link.");
        });
    };

    // Función para cerrar el pop-up
    const closeModal = () => {
        setShowModal(false);
        setIsPlaying(false); // Al cerrar el modal, detenemos la simulación de reproducción
    };

    const getImageClass = () => {
        switch (item.tipo) {
            case 1:
                return 'card-img-rounded'; // Bordes redondeados
            case 2:
                return 'card-img-square'; // Bordes cuadrados
            case 3:
                return 'card-img-circle'; // Foto redonda
            default:
                return 'card-img-rounded'; // Por defecto bordes redondeados
        }
    };
    return (
        <div>
            <div className="card-catalogo">
                <div className="card-icons">
                    <i className="fa-solid fa-plus" onClick={handleClick}></i>
                    {showSharePopup && (
                        <div className="modal-overlay">
                            <div className="share-popup">
                                <p>Comparte este enlace:</p>
                                <input
                                    type="text"
                                    value={
                                        item.tipo === 2
                                            ? `${window.location.origin}/masInfo`
                                            : item.tipo === 1
                                                ? `${window.location.origin}/masInfoAlbum`
                                                : window.location.origin
                                    }
                                    readOnly
                                    className="share-link-input"
                                />
                                <i className="fa-solid fa-copy" onClick={handleCopyLink}></i>
                                <span className="close-button" onClick={() => setShowSharePopup(false)}>&times;</span>
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
                    {item.genero?.nombre ? (
                        <span className="tags-genero me-2 mb-3">{item.genero.nombre}</span>
                        ) : (
                        <h6 style={{ fontStyle: "italic", color: "gray" }}>Cargando género...</h6>)}
                    <div className="info-container">
                        {item.tipo === 2 && (
                            <div>
                                <p className="precio">{item.precio}€</p>
                                <i className="fa-regular fa-circle-play fa-3x" onClick={handlePlayClick}></i>
                                <div className="left-info">{renderStars(item.valoracion)}</div>
                            </div>
                        )}
                        {item.tipo === 1 && (
                            <div>
                                <p className="precio">{item.precio}€</p>
                                <div className="left-info">{renderStars(item.valoracion)}</div>
                            </div>
                        )}
                        {item.tipo === 0 && (
                            <div className="artista-info">
                                <div className="left-info">{renderStars(item.valoracion)}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div>
                {/* Modal de Reproducción */}
                {showModal && <Popup
                    closeModal={closeModal}
                    item={item}
                    togglePlay={togglePlay}
                    isPlaying={isPlaying} />}
            </div>
        </div>
    );
}

function Popup({ closeModal, item, togglePlay, isPlaying}) {
    const [girar, setGirar] = useState(false);
    const audioRef = useRef(null);
    const { token, idLoggedIn } = useContext(UsuarioContext);
    // Alternar entre play y pause
    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return; // ← evita errores si aún no se ha montado

        if (isPlaying) {
            registrarReproduccion(token, idLoggedIn, item.id, 120).catch(err => console.error("Error registrando play:", err));
            audio.play().catch(error => console.log("Error al reproducir:", error));
            setGirar(true);
        } else {
            audio.pause();
            setGirar(false);
        }
    }, [isPlaying]);
    //Para la barra del progreso
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateTime);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateTime);
        };
    }, []);

    //Botones de abance y retroceso
    const handleBackwardClick = () => {
        const audio = audioRef.current;
        if (audio) {
            const newTime = Math.max(audio.currentTime - 10, 0); // retrocede 10s o al inicio
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };
    const handleForwardClick = () => {
        const audio = audioRef.current;
        if (audio) {
            const newTime = Math.min(audio.currentTime + 10, duration); // avanza 10s o al final
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleProgressClick = (e) => {
        const audio = audioRef.current;

        // Aseguramos que usamos el contenedor real (no el hijo `.progreso`)
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;

        if (audio && !isNaN(newTime)) {
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        }
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
                        {/*botones de reproducción*/}
                        <i className="fa-solid fa-backward" onClick={handleBackwardClick}></i>
                        <button onClick={togglePlay}>
                            {isPlaying ?
                                <i className="fa-solid fa-pause"></i> :
                                <i className="fa-solid fa-play"></i>}
                        </button>
                        <i className="fa-solid fa-forward" onClick={handleForwardClick}></i>
                    </div>
                    <div className="tiempo-Barra">
                        <div className='tiempoTranscurrido'>
                            {formatTime(currentTime)}
                        </div>
                        <div className="progress" onClick={handleProgressClick}>
                            <div
                                className="progreso"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            ></div>
                        </div>
                        <div className='tiempoTotal'>
                            {formatTime(duration)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Catalogo;