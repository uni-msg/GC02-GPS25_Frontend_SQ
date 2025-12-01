import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import './MasInfoAlbum.css';
import Popup from '../MetodoPago/MetodoPago.js'; 
import { useLocation } from 'react-router-dom';
import { URL_FOTO, URL_MP3 } from '../../config.js';
import { getCancionesByAlbum } from '../../ApiServices/CancionesService.js'; 
import { getArtistaByElemento, getArtistaById} from '../../ApiServices/ArtistasService.js'; 
import { getValoracionesByIdelem} from '../../ApiServices/ElementosService';
import { getGeneroById} from '../../ApiServices/GeneroService.js';
import { postElementoCesta } from "../../ApiServices/CestaService";
import { getUsuarioById, getUsuarioTieneElementoById, postDesea, deleteDesea, postFavorito, deleteFavorito, getFavoritosByIds, getTieneByIds, getDeseaByIds } from '../../ApiServices/UsuarioService.js';
import { UsuarioContext } from "../InicioSesion/UsuarioContext";
import Carga from '../Utiles/PantallaCarga/PantallaCarga.js';

function MasInfoPageAlbum() {
  const location = useLocation();
  const album = useMemo(() => location.state || {}, [location.state]);

  const audioRef = useRef(null);
  
  const [girar, setGirar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const [loading, setLoading] = useState(true);
  const [tracklist, setTracklist] = useState([]);
  const [primerTrack, setPrimerTrack] = useState({});
  const [productos, setProductos] = useState([{id:null}]);
  
  // Estado para las etiquetas
  const [generoNombre, setGeneroNombre] = useState("Desconocido");
  const [subgeneroNombre, setSubgeneroNombre] = useState("");

  const currentTrack = tracklist[currentTrackIndex] || null;
  const audioUrl = currentTrack ? `${URL_MP3}${currentTrack.urlFoto.replace(/\.[^/.]+$/, "")}.mp3` : null;
  
  const { idLoggedIn, token } = useContext(UsuarioContext);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        if (!album || !album.id) {
            setLoading(false);
            return;
        }

        setProductos([{ id: album.id }]);

        // Preparar datos 
        const infoBasica = {
          nombre: album.nombre,
          // Probamos todas las opciones de nombre para que no falle
          fechacrea: album.fechacrea || album.fechaCrea, 
          descripcion: album.descripcion,
          numventas: album.numventas || album.numVentas || 0,
          valoracion: album.valoracion,
          precio: album.precio,
          esnovedad: album.esnovedad !== undefined ? album.esnovedad : album.esNovedad,
          // Foto: Probamos urlFoto (backend) y fotoamazon (frontend)
          fotoamazon: album.urlFoto || album.fotoamazon || album.fotoAmazon,
          esalbum: true,
          // Acceso seguro al género
          idsubgenero: album.subgenero?.id || album.idSubgenero,
          idgenero: album.genero?.id || album.idGenero,
          idelemento: album.id,
          numrep: 0,
          idalbum: album.id,
          artistaNombre: album.artista.nombreusuario || album.artista.nombrereal || "Desconocido", 
        };

        
        setPrimerTrack(infoBasica);

        // Cargar canciones ---
        const canciones = await getCancionesByAlbum(album.id);
        console.log("Canciones obtenidas:", canciones);

        // Buscar Artista del Álbum
        try {
            const relaciones = await getArtistaByElemento(album.id);
            const relacion = Array.isArray(relaciones) ? relaciones.find(r => r.idelemento === album.id) : relaciones;
            if (relacion?.idartista) {
                const artistData = await getArtistaById(relacion.idartista);
                const a = Array.isArray(artistData) ? artistData[0] : artistData;
                setPrimerTrack(prev => ({ ...prev, artistaNombre: a?.nombrereal || a?.nombre || "Desconocido" }));
            }

        } catch (e) { console.warn("Error artista", e); }

        // Buscar Comentarios
        
        try {
            const vals = await getValoracionesByIdelem(album.id);
            const valsOnlyAlbum = (vals || []).filter(v => v.idelem === album.id);
            const valsEnriched = await Promise.all((valsOnlyAlbum || []).map(async v => {
                try {
                    const u = await getUsuarioById(token, v.iduser);
                    return { 
                        ...v, 
                        usuario: u?.nombreusuario || `Usuario ${v.iduser}` 
                    };
                } catch {
                    return { 
                        ...v,
                        usuario: `Usuario ${v.iduser}`
                    };
                }
            }));

            setPrimerTrack(prev => ({ ...prev, comentarios: valsEnriched }));
        } catch (e) { 
            console.warn("Error comentarios", e); 
        }

        // Procesar la lista de canciones
        try {
            const canciones = await getCancionesByAlbum(album.id);
            
            if (canciones && canciones.length > 0) {
                const tracksEnriched = canciones.map(t => ({
                    ...t,
                    artistaNombre: infoBasica.artistaNombre || "Artista del Álbum", 
                    duration: 0 
                }));
                setTracklist(tracksEnriched);
            }
        } catch (err) {
            console.error("Error cargando canciones:", err);
        }

      } catch (err) {
        console.error("Error crítico:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [album, token]);

  // Carga de Género (Separado para seguridad)
useEffect(() => {
    const fetchEtiquetas = async () => {
      // 1. GÉNERO
      if (album?.genero?.nombre) {
        // Si ya viene en el objeto, lo usamos directamente
        setGeneroNombre(album.genero.nombre);
      } else {
        // Si solo tenemos ID, lo buscamos
        const idG = album?.genero?.id || album?.idGenero;
        if (idG) {
          try {
            const data = await getGeneroById(idG);
            const g = Array.isArray(data) ? data[0] : data;
            setGeneroNombre(g?.nombre || g?.name || "Desconocido");
          } catch (err) { setGeneroNombre("Desconocido"); }
        }
      }

      // 2. SUBGÉNERO (Nuevo)
      if (album?.subgenero?.nombre) {
         // Si ya viene en el objeto (como en tu JSON), lo usamos
         setSubgeneroNombre(album.subgenero.nombre);
      } else {
         // Si solo tenemos ID, lo buscamos
         const idSub = album?.subgenero?.id || album?.idSubgenero;
         if (idSub) {
            try {
              const data = await getGeneroById(idSub); // Asumiendo que subgéneros están en la misma tabla
              const s = Array.isArray(data) ? data[0] : data;
              setSubgeneroNombre(s?.nombre || s?.name || "");
            } catch (err) { console.warn("Error cargando subgénero"); }
         }
      }
    };
    
    fetchEtiquetas();
  }, [album]);

  // Audio Effects (Igual que antes)
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = audioUrl;
    audioRef.current.load();
    if (isPlaying) audioRef.current.play().catch(err => console.warn(err));
    setProgress(0); setCurrentTime(0); setDuration(0);
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
        isPlaying ? audioRef.current.play() : audioRef.current.pause();
        setGirar(isPlaying);
    }
  }, [isPlaying]);

  //verificar favorito 
  useEffect(() => {
    const verificarFavorito = async () => {
      if (token && idLoggedIn && album?.id != null) {
        try {
          const yaFavorito = await getFavoritosByIds(token, idLoggedIn,album.id, false)
          const yaDeseado = await getDeseaByIds(token, idLoggedIn,album.id)
          
          setIsFavorite(yaFavorito);
          setIsDeseado(yaDeseado);
        } catch (error) {
          console.error("Error al verificar si es favorito:", error);
        }
      }
    };
  
    verificarFavorito();
  }, [token, idLoggedIn, album?.id]); // Se ejecuta cuando cambie el token, id o la canción

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (audioRef.current.duration) {
        const newTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={
          i < rating
            ? "bi bi-file-music-fill text-info my-icon" 
            : "bi bi-file-music text-info my-icon"      
        }
      />
    ));
  };

  const handleNext = () => setCurrentTrackIndex(prev => (prev + 1) % tracklist.length);
  const handlePrev = () => setCurrentTrackIndex(prev => (prev - 1 + tracklist.length) % tracklist.length);
  
  const handleComprarClick = () => setShowPopup(true);
  //const toggleFavorite = () => setIsFavorite((prev) => !prev);
    //DESEA 
  const [isDeseado, setIsDeseado] = useState(false);
  const toggleDeseado = async () => {
    const nuevoEstado = !isDeseado;
    setIsDeseado(nuevoEstado);

    if (token && idLoggedIn && album?.id != null) {
      try {
        if (nuevoEstado) {
          const relacion = {
            idusuario: idLoggedIn,
            idelemento: album.id,
          };
          await postDesea(token, relacion);
        } else {
          await deleteDesea(token, idLoggedIn, album.id);
        }
      } catch (error) {
        console.error("Error al actualizar favorito:", error);
      }
    }
  };

  //FAVORITO 
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = async () => {
    const nuevoEstado = !isFavorite;
    setIsFavorite(nuevoEstado);

    if (token && idLoggedIn && album?.id != null) {
      try {
        if (nuevoEstado) {
          const relacion = {
            idusuario: idLoggedIn,
            idelemento: album.id,
            tipo: 2
          };
          await postFavorito(token, relacion);
        } else {
          await deleteFavorito(token, idLoggedIn, album.id, false);
        }
      } catch (error) {
        console.error("Error al actualizar favorito:", error);
      }
    }
  };

  const handleAnadirACesta = async () => {
    if (!token || !idLoggedIn) return alert("Inicia sesión para añadir a la cesta.");
    try {
      await postElementoCesta(token, { idusuario: idLoggedIn, idelemento: album.id });
      alert("¡Producto añadido a la cesta! 🛒");
    } catch (error) { alert("Error al añadir a la cesta."); }
  };

  const [usuariovalorado, setUsuariovalorado] = useState(false);
  const [puedeComentar, setPuedeComentar] = useState(false);

  useEffect(() => {
      if (token && idLoggedIn && currentTrack?.id) {
        getValoracionesByIdelem(currentTrack.id).then(r => { if(Array.isArray(r)) setUsuariovalorado(r.some(v => v.iduser === idLoggedIn)); });
        getUsuarioTieneElementoById(token, idLoggedIn).then(r => { if(Array.isArray(r)) setPuedeComentar(r.some(e => e.id === currentTrack.id)); });
      }
  }, [token, idLoggedIn, currentTrack?.id]);

  if (loading) return <Carga mensaje="Cargando información..." />;

  return (
    <>
      <div id="contenidoCancion" className="p-3 d-flex">
        {/* IZQUIERDA */}
        <div id="colIzquierdaMasInfo" className="me-3">
          <div className="vinilo-wrapper" style={{ animation: `rotar 3s linear infinite`, animationPlayState: girar ? 'running' : 'paused' }}>
            <img className="portada" src={`${URL_FOTO}${primerTrack.fotoamazon}`} alt="Portada" onError={(e) => e.target.src = 'https://via.placeholder.com/300'} />
            <i className="fa-solid fa-record-vinyl vinilo-icon"></i>
          </div>
          
          <div id="reproductor" className="mt-3 p-3 d-flex flex-column align-items-center">
            <div className="reproductorAlineacion mb-3">
              {token && 
              (<>
                <button className="btnDeseaAlbum" onClick={toggleDeseado}>
                  {isDeseado ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}
                </button>
              </>)}
              <button className="btnCancionAnterior" onClick={handlePrev}><i className="fa-solid fa-backward"></i></button>
              <button className="btnPlay" onClick={togglePlay}><i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i></button>
              <button className="btnCancionPosterior" onClick={handleNext}><i className="fa-solid fa-forward"></i></button>
              {token && 
              (<>
                <button className="btnFavoriteAlbum" onClick={toggleFavorite}>
                  {isFavorite ? <i className="fa-solid fa-star"></i> : <i className="fa-regular fa-star"></i>}
                </button>
              </>)}
            </div>
            <div className="barraProgreso d-flex column">
              <div className="tiempoAhora">{formatTime(currentTime)}</div>
              <div className="progress" onClick={handleProgressClick}>
                <div className="progreso" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="duracion">{formatTime(duration)}</div>
            </div>
            <audio ref={audioRef} src={audioUrl} preload="metadata" 
                onTimeUpdate={() => { if(audioRef.current) { setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); setCurrentTime(audioRef.current.currentTime); }}}
                onLoadedMetadata={() => { if(audioRef.current) setDuration(audioRef.current.duration); }}
                onEnded={handleNext} 
            />
          </div>

          <div className="d-flex justify-content-between align-items-center my-3">
            <span className="precio mb-0">{primerTrack.precio}€</span>
            <div className="estrellas">{renderStars(primerTrack.valoracion)}</div>
          </div>
          
          {!puedeComentar && (
          <div className="mb-3">
            <button className="btn btn-comprar" onClick={handleComprarClick}>Comprar ya</button>
            <button className="btn btn-anadircesta" onClick={handleAnadirACesta}>Añadir a la cesta</button>
          </div> )}

          <div id="comentarios" className="mb-3 text-start">
            <h3>Comentarios:</h3>
            {primerTrack.comentarios?.length > 0 ? primerTrack.comentarios.map((c, i) => (
                <div key={i} className="cardComentario mb-2">
                   <div className="cardHeaderComentario"><div>{c.usuario}:</div><div>{renderStars(c.valoracion)}</div></div>
                   <div className="cardBodyComentario"><p>{c.comentario}</p></div>
                </div>
            )) : <p className="text-muted">No hay comentarios.</p>}
          </div>
        </div>
       
        {/* Columna derecha se muestra siempre */}
        <div id="colDerechaMasInfo">
          <div className="tituloCancion"><h1>{primerTrack.nombre}</h1></div>
          <div className="nombreArtista">{primerTrack.artistaNombre || "Artista del Álbum"}</div>
          <div className="descripcionCancion"><p>{primerTrack.descripcion}</p></div>
          
          <div id="etiquetas">
            {generoNombre && <span className="tags me-2">{generoNombre}</span>}
            {subgeneroNombre && <span className="tags me-2">{subgeneroNombre}</span>}
          </div>
          
          <div className="numVentas"><p>Número de ventas: {primerTrack.numventas}</p></div>
          
          <div id="tracklist" className="mb-3">
            <h3>Lista de reproducción:</h3>
            {tracklist.length > 0 ? (
            <ul className="lista list-group">
              {tracklist.map((track, idx) => (
                <li key={track.id || idx} className={`listaTracks list-group-item ${idx === currentTrackIndex ? "active" : ""}`} onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}>
                  <div className="numTrack"><small>{idx + 1}</small></div>
                  <div className="bloqueTitulo">
                    <h5 className="tituloTrack">{track.nombre}</h5>
                    <small>{track.artistaNombre}</small>
                  </div>
                  <div className="duracionTrack"><small>{formatTime(track.duration || 0)}</small></div>
                </li>
              ))}
            </ul>
            ) : <p className="text-muted">No se encontraron canciones.</p>}
          </div>
        </div>
      </div>

      {showPopup && <Popup precio={primerTrack.precio} productos={productos} idUsuario={idLoggedIn} tokenUsuario={token} closePopup={() => setShowPopup(false)} />}
    </>
  );
}

export default MasInfoPageAlbum;