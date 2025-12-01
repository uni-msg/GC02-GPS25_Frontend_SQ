import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga.js';
// Importamos TODO del servicio actualizado
import * as ComunidadService from '../../ApiServices/ComunidadService.js';
import './MasInfoComunidad.css';

// Importamos las imágenes por defecto y el icono de verificado
import ComunidadDefecto from '../../Recursos/comunidadDefecto.png';
import PerfilDefecto from '../../Recursos/perfilDefecto.png';

const MasInfoComunidad = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const comunidadDataInicial = location.state;

    // Estados de datos básicos
    // eslint-disable-next-line no-unused-vars
    const [comunidad, setComunidad] = useState(comunidadDataInicial);
    const [publicaciones, setPublicaciones] = useState([]);
    const [miembros, setMiembros] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados de usuario normal
    const [esMiembro, setEsMiembro] = useState(false);
    const [likesUsuario, setLikesUsuario] = useState({}); 
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Estados para Artista (Admin) 
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false); // Modal de administración general
    const [palabrasVetadas, setPalabrasVetadas] = useState([]);
    const [usuariosVetadosIDs, setUsuariosVetadosIDs] = useState([]); // Lista de IDs de usuarios vetados
    const [nuevaPalabraInput, setNuevaPalabraInput] = useState("");

    // Estados para Editar Publicación
    const [verModeloEdicion, ponerModeloEdicion] = useState(false);
    const [edicionPublicacion, ajustarEdicionPublicacion] = useState(null); // Guardamos el objeto entero de la publicación a editar
    // Estado para los inputs del formulario del modal
    const [datosFormEdicion, ponerDatosFormEdicion] = useState({ titulo: '', contenido: '' });

    const { isLoggedIn, idLoggedIn } = useContext(UsuarioContext);

    // 1. DETERMINAR SI ES ADMIN
    useEffect(() => {        
        // Agrupamos los logs en la consola para que sea fácil de leer
        console.group("🔍 DIAGNÓSTICO DE ADMIN - MasInfoComunidad");

        // CHIVATO 1: Ver qué datos tenemos de la comunidad exactamente
        console.log("📦 Objeto 'comunidad' recibido:", comunidad);

        // CHIVATO 2: Ver qué datos tenemos del usuario logueado
        console.log(`👤 Usuario logueado ID: ${idLoggedIn} (Tipo: ${typeof idLoggedIn})`);
        console.log("👤 ¿Está logueado?:", isLoggedIn);

        // Validaciones básicas
        if (!comunidad || !isLoggedIn || !idLoggedIn) {
             console.warn("⚠️ Faltan datos para hacer la comprobación. Abortando.");
             console.groupEnd();
             return;
        }

        if (!comunidad || !isLoggedIn || !idLoggedIn) return;

        const creadorIdRaw = comunidad.artista?.idArtista;

        setIsAdmin(creadorIdRaw?.toString() === idLoggedIn.toString());
        }, [comunidad, isLoggedIn, idLoggedIn]);


    // 2. CARGAR DATOS
    useEffect(() => {
        if (comunidad?.idComunidad) {
            fetchData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comunidad]); // Recargamos si cambia el estado de admin

    const fetchData = async () => {
        setIsLoading(true);
        try {
            console.log("Iniciando fetchData...");

            // Carga básica (siempre)
            const [dataPublis, dataMiembros, dataPalabras] = await Promise.all([
                ComunidadService.getPublicacionesComunidad(comunidad.idComunidad),
                ComunidadService.getMiembrosComunidad(comunidad.idComunidad),
                ComunidadService.getPalabrasVetadas(comunidad.idComunidad) // <--- MOVIDO AQUÍ
            ]);

            setPublicaciones(dataPublis);
            setMiembros(dataMiembros);
            setPalabrasVetadas(dataPalabras);

            if (isLoggedIn && idLoggedIn) {
                const soyYo = dataMiembros.find(m => m.idUsuario === idLoggedIn);
                setEsMiembro(!!soyYo);
                await checkLikes(dataPublis);
            }

            // SI ES ADMIN: Cargar datos extra (palabras y usuarios vetados)
            if (isAdmin) {
                const dataVetadosIds = await ComunidadService.getUsuariosVetadosIds(comunidad.idComunidad);
                setUsuariosVetadosIDs(dataVetadosIds);
            }

        } catch (err) {
            console.error("Error al cargar detalles:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- FUNCIONES EXISTENTES (Likes, Unirse) ---
    const checkLikes = async (publis) => {
        const likesStatus = {};
        for (const pub of publis) {
            try {
                const listaLikes = await ComunidadService.getLikesPublicacion(pub.idPublicacion);
                // eslint-disable-next-line eqeqeq
                const diLike = listaLikes.some(l => l.idUsuario == idLoggedIn);
                likesStatus[pub.idPublicacion] = diLike;
            } catch (e) { console.warn(e); }
        }
        setLikesUsuario(likesStatus);
    };

    const toggleLike = async (idPublicacion) => {
        if (!isLoggedIn || !esMiembro) return alert("Debes ser miembro e iniciar sesión.");
        const yaDioLike = likesUsuario[idPublicacion];
        try {
            let data;
            if (yaDioLike) data = await ComunidadService.quitarLikePublicacion(idPublicacion, idLoggedIn);
            else data = await ComunidadService.darLikePublicacion(idPublicacion, idLoggedIn);
            
            setLikesUsuario(prev => ({ ...prev, [idPublicacion]: !yaDioLike }));
            setPublicaciones(prev => prev.map(p => p.idPublicacion === idPublicacion ? { ...p, meGusta: data.meGusta } : p));
        } catch (err) { alert(err.message); }
    };

    const toggleMembresia = async () => {
        if (!isLoggedIn) return alert("Debes iniciar sesión.");
        try {
            if (esMiembro) {
                await ComunidadService.salirComunidad(comunidad.idComunidad, idLoggedIn);
                setEsMiembro(false);
                // eslint-disable-next-line eqeqeq
                setMiembros(prev => prev.filter(m => m.idUsuario != idLoggedIn));
            } else {
                const nuevo = await ComunidadService.unirseComunidad(comunidad.idComunidad, idLoggedIn);
                setEsMiembro(true);
                setMiembros(prev => [...prev, nuevo]);
                checkLikes(publicaciones);
            }
        } catch (err) { alert(err.message); }
    };

    // --- COMUNIDAD (Artista Admin) ---
    const manejarEliminarComunidad = async () => {
        if(window.confirm("PELIGRO: ¿Estás seguro de eliminar esta comunidad permanentemente? No hay vuelta atrás.")){
             try {
                 await ComunidadService.eliminarComunidad(comunidad.idComunidad);
                 alert("Comunidad eliminada.");
                 navigate('/'); // Volver al listado
             } catch (e) { alert(e.message); }
        }
    };

    // --- PUBLICACIONES (Artista Admin) ---
const manejarCrearPublicacion = async () => {
        // Placeholder: Usar prompt para simular formulario
        const titulo = prompt("Título de la nueva publicación:");
        // Validaciones básicas: si cancela o deja vacío, no hacemos nada.
        if (!titulo || titulo.trim() === "") return;
        
        const contenido = prompt("Contenido:");
        if (!contenido || contenido.trim() === "") return;
        
        // Obtenemos la ruta del fichero (puede ser una cadena vacía si no escribe nada)
        const rutaFicheroInput = prompt("Ruta del fichero (opcional, dejar en blanco):");
        
        // Procesamos la ruta: si es cadena vacía o null, enviamos null explícitamente.
        // Si tiene contenido, lo limpiamos de espacios con trim().
        const rutaFicheroFinal = (rutaFicheroInput && rutaFicheroInput.trim() !== "") 
                                ? rutaFicheroInput.trim() 
                                : null;

        try {
            // 1. Creamos el objeto JSON simple
            const datosJson = {
                titulo: titulo.trim(),
                contenido: contenido.trim(),
                rutaFichero: rutaFicheroFinal,
                idComunidad: comunidad.idComunidad, // ID numérico
                idUsuario: idLoggedIn // ID numérico
            };
            
            console.log("📤 Enviando JSON para crear publicación:", datosJson);

            // 2. Llamada al servicio pasando el objeto JSON
            await ComunidadService.crearPublicacion(comunidad.idComunidad, datosJson);
            
            alert("Publicación creada exitosamente.");
            fetchData(); // Recargamos la lista para que aparezca la nueva
            
        } catch (e) {
            console.error("Error al crear publicación:", e);
            // Mostramos el mensaje de error del backend si existe, o uno genérico
            const mensajeError = e.response?.data?.error || e.message || "Error desconocido.";
            alert("Error al crear: " + mensajeError);
        }
    };


    const manejarEliminarPublicacion = async (idPubli) => {
        if(window.confirm("¿Borrar esta publicación permanentemente?")){
            try {
                await ComunidadService.eliminarPublicacion(comunidad.idComunidad, idPubli);
                // Actualizamos estado local para quitarla sin recargar toda la página
                setPublicaciones(prev => prev.filter(p => p.idPublicacion !== idPubli));
            } catch (e) { alert(e.message); }
        }
    }

    const manejarEditarPublicacion = (publicacion) => {
    // 1. Guardamos cuál estamos editando por si acaso
        ajustarEdicionPublicacion(publicacion);
        // 2. PRE-RELLENAMOS el formulario con los datos actuales
        ponerDatosFormEdicion({
            titulo: publicacion.titulo,
            contenido: publicacion.contenido
        });
        // 3. Abrimos el modal
        ponerModeloEdicion(true);
    };

    // Guardar los cambios tras editar una publicación
    const manejarGuardarEdicion = async () => {
        // 1. Validaciones básicas 
        if (!datosFormEdicion.titulo.trim()) {
            alert("El título es obligatorio.");
            return;
        }
        if (!datosFormEdicion.contenido.trim()) {
            alert("El contenido es obligatorio.");
            return;
        }

        try {
            // 2. Preparamos el objeto de datos para enviar como JSON
            const datosParaEnviar = {
                titulo: datosFormEdicion.titulo,
                contenido: datosFormEdicion.contenido,
                // Aquí la clave: si la ruta es nula o cadena vacía, enviamos null explícitamente.
                // Si tuviéramos un input para esto, sería: datosFormEdicion.rutaFichero || null
                rutaFichero: null // Como no lo editamos, lo mandamos null por ahora.
            };

            // 3. Llamada al servicio (PUT)
            const publiActualizada = await ComunidadService.editarPublicacion(comunidad.idComunidad, edicionPublicacion.idPublicacion, datosParaEnviar);

            // 4. Actualizamos la lista en pantalla sin recargar
            setPublicaciones(prev => prev.map(p => 
                p.idPublicacion === publiActualizada.idPublicacion ? publiActualizada : p
            ));

            alert("¡Publicación actualizada con éxito!");

            // 5. Cerramos el modal y limpiamos los estados
            ponerModeloEdicion(false);
            ajustarEdicionPublicacion(null);
            // Opcional: resetear el formulario
            // ponerDatosFormEdicion({ titulo: '', contenido: '' });

        } catch (e) {
            console.error("Error al editar:", e);
            // Muestra el mensaje de error del backend si existe
            const mensajeError = e.response?.data?.error || e.message || "Error desconocido al guardar.";
            alert("Error al guardar los cambios: " + mensajeError);
        }
    };

    // --- USUARIOS VETADOS (Se gestionan en la columna de miembros) ---
    const manejarVeto = async (miembroId, isVetadoActualmente) => {
        const accion = isVetadoActualmente ? "levantar el veto a" : "vetar a";
        if(window.confirm(`¿Seguro que quieres ${accion} este usuario?`)){
            try {
                if(isVetadoActualmente) {
                    await ComunidadService.quitarVetoUsuario(comunidad.idComunidad, miembroId);
                    // eslint-disable-next-line eqeqeq
                    setUsuariosVetadosIDs(prev => prev.filter(id => id != miembroId));
                } else {
                    await ComunidadService.vetarUsuario(comunidad.idComunidad, miembroId);
                    setUsuariosVetadosIDs(prev => [...prev, miembroId]);
                }
            } catch (e) { alert(e.message); }
        }
    };

    // --- PALABRAS VETADAS (Se gestionan en el modal de admin) ---
    const manejarAddPalabra = async () => {
        if(!nuevaPalabraInput.trim()) return;
        try {
            const nuevaLista = await ComunidadService.addPalabraVetada(comunidad.idComunidad, nuevaPalabraInput.trim());
            setPalabrasVetadas(nuevaLista);
            setNuevaPalabraInput("");
        } catch (e) { alert(e.message); }
    };

    const manejarEliminarPalabra = async (palabra) => {
        try {
            const nuevaLista = await ComunidadService.eliminarPalabraVetada(comunidad.idComunidad, palabra);
            setPalabrasVetadas(nuevaLista);
        } catch (e) { alert(e.message); }
    };


    // ==========================================
    // RENDERIZADO
    // ==========================================

    if (error) return <div className="p-5 error-text">Error: {error}</div>;
    if (!comunidad) return <div className="p-5">No se ha encontrado la comunidad.</div>;

    return (
        <div id="masInfoComunidad">
            {/* --- CABECERA --- */}
            <div className="comunidad-header-info">
                <h1 className="titulo-comunidad">
                    {comunidad.nombreComunidad}
                    {/* Botón unirse/salir: SOLO si NO eres admin */}
                    {isLoggedIn && !isAdmin && (
                        <button 
                            type="button" 
                            className={`btnUnirse ${esMiembro ? 'btn-danger' : 'btn-success'}`} 
                            onClick={toggleMembresia}
                        >
                            {esMiembro ? "Salir" : "Unirse"}
                        </button>
                    )}
                </h1>
                
                <div className="imagen-container-header">
                    <img
                        src={comunidad.rutaImagen || ComunidadDefecto}
                        alt={comunidad.nombreComunidad}
                        className="imagen-detalle"
                    />
                    
                    {/* Botonera debajo de la imagen */}
                    <div className="d-flex gap-3 mt-3">
                        {/* Botón Info (Siempre visible) */}
                        <button className="btn-ver-info" onClick={() => setShowInfoModal(true)}>
                            <i className="bi bi-info-circle-fill me-2"></i> Info
                        </button>

                        {/* Botón Administrar (SOLO ADMIN) */}
                        {isAdmin && (
                            <button className="btn-administrar" onClick={() => setShowAdminModal(true)}>
                                <i className="bi bi-gear-fill me-2"></i> Administrar Comunidad
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="desc-comunidad">
                    <p>{comunidad.descComunidad || "Sin descripción."}</p>
                </div>
            </div>

            {/* --- MODALES --- */}

            {/* 1. MODAL INFO PÚBLICA */}
            {showInfoModal && (
                <div className="info-modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Información de la Comunidad</h3>
                            <button className="btn-close-modal" onClick={() => setShowInfoModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <ul className="modal-info-list">
                            <li>
                                <strong>Creador:</strong> 
                                <span> {comunidad.artista?.nombreUsuario || "Desconocido"}</span>
                            </li>
                            <li>
                                <strong>Fecha de creación:</strong> 
                                <span> {new Date(comunidad.fechaCreacion).toLocaleDateString()}</span>
                            </li>
                            <li>
                                <strong>Palabras vetadas:</strong> 
                                {/* Usamos un ternario para comprobar si hay palabras */}
                                <span>
                                    {palabrasVetadas.length > 0 
                                        ? palabrasVetadas.join(", ") // Si hay, las unimos con coma y espacio
                                        : "Ninguna"                  // Si no hay, mostramos "Ninguna"
                                    }
                                </span>
                            </li>
                            <li>
                                <strong>ID:</strong> 
                                <span> #{comunidad.idComunidad}</span>
                            </li>
                             <li>
                                <strong>Miembros:</strong> 
                                <span> {miembros.length}</span>
                            </li>
                             <li>
                                <strong>Publicaciones:</strong> 
                                <span> {publicaciones.length}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* 2. MODAL DE ADMINISTRACIÓN (Solo Admin) */}
            {isAdmin && showAdminModal && (
                <div className="info-modal-overlay" onClick={() => setShowAdminModal(false)}>
                    <div className="info-modal-content admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-danger"><i className="bi bi-gear-fill me-2"></i>Administración</h3>
                            <button className="btn-close-modal" onClick={() => setShowAdminModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <div className="admin-section mb-4">
                            <h5>Acciones Generales</h5>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-primary" onClick={() => alert("Abrir formulario editar comunidad")}>
                                    <i className="bi bi-pencil me-2"></i>Editar Datos
                                </button>
                                <button className="btn btn-outline-danger" onClick={manejarEliminarComunidad}>
                                    <i className="bi bi-trash-fill me-2"></i>Eliminar Comunidad
                                </button>
                            </div>
                        </div>

                        <div className="admin-section">
                            <h5>Gestión de Palabras Vetadas</h5>
                            <div className="input-group mb-3">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Añadir nueva palabra..."
                                    value={nuevaPalabraInput}
                                    onChange={(e) => setNuevaPalabraInput(e.target.value)}
                                />
                                <button className="btn btn-secondary" onClick={manejarAddPalabra} disabled={!nuevaPalabraInput.trim()}>
                                    Añadir
                                </button>
                            </div>
                            <div className="palabras-container p-2 border rounded bg-light">
                                {palabrasVetadas.length === 0 ? <span className="text-muted small">No hay palabras vetadas.</span> : 
                                    palabrasVetadas.map((p, idx) => (
                                        <span key={idx} className="badge bg-white text-dark border m-1 pe-1">
                                            {p}
                                            <button className="btn btn-sm text-danger p-0 ms-2" onClick={() => manejarEliminarPalabra(p)}>
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* --- CONTENIDO PRINCIPAL (2 COLUMNAS) --- */}
            <div id="contenidoComunidad">
                {isLoading ? (
                    <PantallaCarga />
                ) : (
                    <div className="grid-contenido">
                        
                        {/* COLUMNA IZQUIERDA: PUBLICACIONES */}
                        <div className="seccion-publicaciones">
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <h3 className="m-0 text-purple">Publicaciones ({publicaciones.length})</h3>
                                {/* Botón CREAR (Solo Admin) */}
                                {isAdmin && (
                                    <button className="btn btn-sm btn-primary" onClick={manejarCrearPublicacion}>
                                        <i className="bi bi-plus-lg me-1"></i>Nueva
                                    </button>
                                )}
                            </div>

                            {publicaciones.length === 0 ? (
                                <p className="text-muted">Aún no hay publicaciones en esta comunidad.</p>
                            ) : (
                                <div className="lista-publicaciones">
                                    {publicaciones.map((pub) => (
                                        <div key={pub.idPublicacion} className="publicacion-card position-relative">
                                            {/* Acciones Admin en la publicación */}
                                            {isAdmin && (
                                                <div className="admin-pub-actions position-absolute top-0 end-0 p-2">
                                                    <button className="btn btn-sm btn-link text-primary p-0 me-2" onClick={() => manejarEditarPublicacion(pub)} title="Editar">
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-link text-danger p-0" onClick={() => manejarEliminarPublicacion(pub.idPublicacion)} title="Eliminar">
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </div>
                                            )}

                                            <h4 className={isAdmin ? "pe-5" : ""}>{pub.titulo}</h4>
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

                        {/* COLUMNA DERECHA: MIEMBROS */}
                        <div className="seccion-miembros">
                            <h3 className="text-purple border-bottom pb-2 mb-3">Miembros ({miembros.length})</h3>
                            <ul className="lista-miembros">
                                {miembros.map((miembro) => {
                                    // Comprobamos si está vetado usando la lista de IDs cargada
                                    // eslint-disable-next-line eqeqeq
                                    const isVetado = usuariosVetadosIDs.some(id => id == miembro.idUsuario);
                                    // eslint-disable-next-line eqeqeq
                                    const isSelf = miembro.idUsuario == idLoggedIn;

                                    return (
                                    <li key={miembro.idUsuario} className={`miembro-item ${isVetado ? 'vetado-item' : ''}`}>
                                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                                            <img 
                                                src={miembro.rutaFoto || PerfilDefecto} 
                                                alt="avatar" 
                                                className="miembro-avatar"
                                            />
                                            <div className="d-flex flex-column">
                                                <span>{miembro.nombreUsuario || `Usuario ${miembro.idUsuario}`}
                                                    {miembro.esArtista && <i className="bi bi-patch-check-fill text-primary ms-2" title="Artista verificado"></i>}
                                                </span>
                                                {isVetado && <span className="badge bg-danger" style={{fontSize: '0.7rem', width: 'fit-content'}}>Vetado</span>}
                                            </div>
                                        </div>
                                        
                                        {/* Botón Vetar/Perdonar (Solo Admin y no a sí mismo) */}
                                        {isAdmin && !isSelf && (
                                            <button 
                                                className={`btn btn-sm ${isVetado ? 'btn-outline-success' : 'btn-outline-danger'} ms-2 py-0 px-2`}
                                                style={{fontSize: '0.8rem'}}
                                                onClick={() => manejarVeto(miembro.idUsuario, isVetado)}
                                                title={isVetado ? "Levantar castigo" : "Vetar usuario"}
                                            >
                                                <i className={`bi ${isVetado ? 'bi-check-circle' : 'bi-ban'}`}></i>
                                            </button>
                                        )}
                                    </li>
                                )})}
                            </ul>
                        </div>

                    </div>
                )}
            </div>
           {/* --- MODAL DE EDICIÓN DE PUBLICACIÓN --- */}
            {verModeloEdicion && (
                <div className="info-modal-overlay" onClick={() => ponerModeloEdicion(false)}>
                    {/* Usamos stopPropagation para que clics dentro del modal no lo cierren */}
                    <div className="info-modal-content admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header mb-4">
                            <h3 className="text-primary"><i className="bi bi-pencil-square me-2"></i>Editar Publicación</h3>
                            <button className="btn-close-modal" onClick={() => ponerModeloEdicion(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="editTitulo" className="form-label fw-bold">Título</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="editTitulo"
                                    // El valor viene del estado del formulario
                                    value={datosFormEdicion.titulo}
                                    // Al cambiar, actualizamos solo la propiedad 'titulo' del estado
                                    onChange={(e) => ponerDatosFormEdicion({...datosFormEdicion, titulo: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="editContenido" className="form-label fw-bold">Contenido</label>
                                <textarea 
                                    className="form-control" 
                                    id="editContenido" 
                                    rows="5"
                                    value={datosFormEdicion.contenido}
                                    onChange={(e) => ponerDatosFormEdicion({...datosFormEdicion, contenido: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button className="btn btn-outline-secondary" onClick={() => ponerModeloEdicion(false)}>
                                    Cancelar
                                </button>
                                {/* Este botón llama a la función de guardar que pegaste arriba */}
                                <button className="btn btn-primary" onClick={manejarGuardarEdicion}>
                                    <i className="bi bi-save me-2"></i>Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>  // div final del componente
    );
};

export default MasInfoComunidad;