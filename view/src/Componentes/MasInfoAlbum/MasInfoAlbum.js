import React, { useState, useRef, useEffect, useMemo } from 'react';
import './MasInfoAlbum.css';
import Popup from '../MetodoPago/MetodoPago.js'; // Asegúrate de que la ruta sea correcta
import { useLocation } from 'react-router-dom';
//Para base de datos:
import { AMAZON_URL_FOTO, AMAZON_URL_MP3 } from '../../config.js';
import { getCancionesByAlbum } from '../../ApiServices/CancionesService.js'; 
import { getArtistaByElemento, getArtistaById} from '../../ApiServices/ArtistasService.js'; 
import { getValoracionesByIdelem} from '../../ApiServices/ElementosService';
import { getGeneroById, getSubgeneroByElementoId } from '../../ApiServices/GeneroService.js';
import { postElementoCesta } from "../../ApiServices/CestaService";
import { getUsuarioById } from '../../ApiServices/UsuarioService.js';
import { useContext } from "react";
import { UsuarioContext } from "../InicioSesion/UsuarioContext";
import { getUsuarioTieneElementoById } from '../../ApiServices/UsuarioService.js';
import Carga from '../Utiles/PantallaCarga/PantallaCarga.js';

function MasInfoPageAlbum() {
  const location = useLocation();
  const album = useMemo(() => location.state, [location.state]);

  const audioRef = useRef(null);
  // Si no hay album, o no tiene al menos un audioUrl, evitamos romper todo
  const hasAudio = album?.audioUrl?.length > 0;

  const [girar, setGirar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  //BACKEND 
  //Cogemos las canciones del album actual
  const [loading, setLoading] = useState(true);
  const [tracklist, setTracklist] = useState([]);
  const [primerTrack, setPrimerTrack] = useState({});
  const currentTrack = tracklist[currentTrackIndex] || null;
  const audioUrl = currentTrack ? `${AMAZON_URL_MP3}${currentTrack.fotoamazon}` : null;
  const { idLoggedIn, token } = useContext(UsuarioContext);
  const [generoNombre, setGeneroNombre] = useState("Desconocido");
  const [subgeneroNombre, setSubgeneroNombre] = useState("Desconocido");
  const [productos, setProductos] = useState([{id:null}]);
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setProductos(prevProductos => [
          { id: album.id } 
        ]);

        const canciones = await getCancionesByAlbum(album.id);
        console.log("Canciones obtenidas:", canciones);
         
        const primerTrack = {
          nombre: album.nombre,
          fechacrea: album.fechaCrea,
          descripcion: album.descripcion,
          numventas: album.numVentas,
          valoracion: album.valoracion,
          precio: album.precio,
          esnovedad: album.esNovedad,
          fotoamazon: album.fotoAmazon,
          esalbum: album.esAlbum,
          idgenero: album.idGenero,
          idelemento: album.id,
          numrep: 0,
          idalbum: album.id,
          nombreamazon: album.fotoAmazon,
        };
      // Obtener los comentarios de primerTrack
      let valoracionesPrimerTrack = [];
      try {
        valoracionesPrimerTrack = await getValoracionesByIdelem(primerTrack.idelemento);
      } catch (err) {
        console.warn(`⚠️ No se pudieron obtener valoraciones para el primer track ${primerTrack.idelemento}`, err);
        valoracionesPrimerTrack = []; // Si hay error, dejamos comentarios vacío
      } finally {
        // Solo se desactiva cuando todo lo anterior termina
        setLoading(false);
      }

      // Mapear los comentarios de primerTrack con los nombres de los usuarios
      const valoracionesPrimerTrackConNombres = await Promise.all(
        (Array.isArray(valoracionesPrimerTrack) ? valoracionesPrimerTrack : []).map(async (valoracion) => {
          try {
            const usuario = await getUsuarioById(token, valoracion.idusuario);
            return {
              ...valoracion,
              usuario: usuario?.nombreusuario || `Usuario ${valoracion.idusuario}`,
            };
          } catch {
            return {
              ...valoracion,
              usuario: `Usuario ${valoracion.idusuario}`,
            };
          } finally {
            // Solo se desactiva cuando todo lo anterior termina
            setLoading(false);
          }
        })
      );

      // Actualizar el estado de primerTrack con los comentarios obtenidos
      setPrimerTrack({
        ...primerTrack,
        comentarios: valoracionesPrimerTrackConNombres,
      });

        const tracklistCompleto = [...canciones];
        const artistasRaw = await getArtistaById(null); // esto trae todos no sé por qué no filtra por id xdd pero bueno

        const tracklistConArtistasYComentarios = await Promise.all(
          tracklistCompleto.map(async (track) => {
            try {
              const relaciones = await getArtistaByElemento(track.idelemento);
              const relacionCorrecta = relaciones.find(r => r.idelemento === track.idelemento);
              const idArtista = relacionCorrecta?.idartista;
              const artista = Array.isArray(artistasRaw)
                ? artistasRaw.find((a) => a.id === idArtista)
                : null;

               // Obtener comentarios
               let valoraciones = [];
               try {
                 valoraciones = await getValoracionesByIdelem(track.idelemento);
               } catch (err) {
                 console.warn(`⚠️ No se pudieron obtener valoraciones para track ${track.idelemento}`, err);
                 valoraciones = []; // si hay error, dejamos comentarios vacío
               } finally {
                // Solo se desactiva cuando todo lo anterior termina
                setLoading(false);
              }
              const valoracionesConNombres = await Promise.all(
              (Array.isArray(valoraciones) ? valoraciones : []).map(async (valoracion) => {
              try {
                const usuario = await getUsuarioById(token, valoracion.idusuario);
                return {
                  ...valoracion,
                  usuario: usuario?.nombreusuario || `Usuario ${valoracion.idusuario}`,
                };
              } catch {
                return {
                  ...valoracion,
                  usuario: `Usuario ${valoracion.idusuario}`,
                };
              }
            })
          );
      // Obtener duración del audio
      let duration = 0;
      try {
        if (track.fotoamazon) {
          const audioUrl = `${AMAZON_URL_MP3}${track.fotoamazon}`;
          duration = await new Promise((resolve) => {
            const audio = new Audio();
            audio.src = audioUrl;
            
            const onLoadedMetadata = () => {
              resolve(audio.duration);
              audio.removeEventListener('loadedmetadata', onLoadedMetadata);
              audio.removeEventListener('error', onError);
            };
            
            const onError = () => {
              console.error(`Error al cargar audio para track ${track.idelemento}`);
              resolve(0);
              audio.removeEventListener('loadedmetadata', onLoadedMetadata);
              audio.removeEventListener('error', onError);
            };
            
            audio.addEventListener('loadedmetadata', onLoadedMetadata);
            audio.addEventListener('error', onError);
            
            // Timeout por si el audio no carga
            setTimeout(() => {
              audio.removeEventListener('loadedmetadata', onLoadedMetadata);
              audio.removeEventListener('error', onError);
              resolve(0);
            }, 5000);
          });
        }
      } catch (error) {
        console.error(`Error al obtener duración para track ${track.idelemento}:`, error);
        duration = 0;
      }

              return { ...track, artistaNombre: artista?.nombrereal || "Desconocido" ,
                comentarios: valoracionesConNombres,
                duration: duration};
            } catch (err) {
              console.error("❌ Error al obtener artista para track:", track, err);
              return { ...track, artistaNombre: "Desconocido" , comentarios:[],
                duration: 0};
            } finally {
              // Solo se desactiva cuando todo lo anterior termina
              setLoading(false);
            }
          })
        );        
  
        setTracklist(tracklistConArtistasYComentarios);
        console.log("🎵 Tracklist enriquecido:", tracklistConArtistasYComentarios);
      } catch (err) {
        console.error("❌ Error al obtener canciones:", err);
      } finally {
        // Solo se desactiva cuando todo lo anterior termina
        setLoading(false);
      }
    };
    fetchTracks();
  }, [album]);

  
  // Género principal
  useEffect(() => {
    const fetchGenero = async () => {
    try {
      const data = await getGeneroById(album.idGenero);
      console.log("🎼 Género principal:", data);

      if (Array.isArray(data)) {
        setGeneroNombre(data[0]?.name || "Desconocido");
      } else {
        setGeneroNombre(data?.name || "Desconocido");
      }
    } catch (err) {
      console.warn("⚠️ Error al obtener el género principal", err);
      setGeneroNombre("Desconocido");
    } finally {
      // Solo se desactiva cuando todo lo anterior termina
      setLoading(false);
    }
  };

  if (album?.idGenero) {
    fetchGenero();
  }
}, [album.idGenero]);

// Subgénero
useEffect(() => {
  const fetchSubgenero = async () => {
    try {
      const relacion = await getSubgeneroByElementoId(album.id);
      console.log("🎼 Relación subgénero:", relacion);

      if (relacion?.idgenero) {
        const generoData = await getGeneroById(relacion.idgenero);

        if (Array.isArray(generoData)) {
          setSubgeneroNombre(generoData[0]?.name || "");
        } else {
          setSubgeneroNombre(generoData?.name || "");
        }
      } else {
        setSubgeneroNombre(null);
      }
    } catch (err) {
      console.warn("⚠️ Error al obtener el subgénero", err);
      setSubgeneroNombre("Desconocido");
    } finally {
      // Solo se desactiva cuando todo lo anterior termina
      setLoading(false);
    }
  };

  if (album?.id) {
    fetchSubgenero();
  }
}, [album.id]);
  
useEffect(() => {
  if (!audioUrl || !audioRef.current) return;

  // Pausamos el actual
  audioRef.current.pause();

  // Actualiza src manualmente por si no lo hace React (extra seguro)
  audioRef.current.src = audioUrl;
  audioRef.current.load();

  if (isPlaying) {
    audioRef.current.play().catch(err => console.warn("⚠️ No se pudo reproducir:", err));
  }

  setProgress(0);
  setCurrentTime(0);
  setDuration(0);
}, [audioUrl]);

useEffect(() => {
  if (audioRef.current) {
    if (isPlaying) {
      audioRef.current.play();
      setGirar(true);
    } else {
      audioRef.current.pause();
      setGirar(false);
    }
  }
}, [isPlaying]);

const togglePlay = () => setIsPlaying(!isPlaying);

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const handleProgressClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  if (!Number.isFinite(audioRef.current.duration) || audioRef.current.duration === 0) return;
  const newTime = (clickX / rect.width) * audioRef.current.duration;
  audioRef.current.currentTime = newTime;
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

const handleNext = () => {
  let newIndex = currentTrackIndex + 1;
  if (newIndex >= tracklist.length) newIndex = 0;
  setCurrentTrackIndex(newIndex);
};

const handlePrev = () => {
  let newIndex = currentTrackIndex - 1;
  if (newIndex < 0) newIndex = tracklist.length - 1;
  setCurrentTrackIndex(newIndex);
};
  const handleComprarClick = () => setShowPopup(true);
  const toggleFavorite = () => setIsFavorite((prev) => !prev);

  //AÑADIR A CESTA

  const handleAnadirACesta = async () => {
    try {
      if (!token || !idLoggedIn) {
        alert("Debes iniciar sesión para añadir a la cesta.");
        return;
      }

      const response = await postElementoCesta(token, {
        idusuario: idLoggedIn,
        idelemento: album.id,
      });

      alert("¡Producto añadido a la cesta! 🛒");
    } catch (error) {
      console.error("Error al añadir el producto a la cesta:", error);

      if (error.response) {
        console.error("Respuesta del backend:", error.response.data);
        alert(`Error: ${error.response.data.detail || 'No se pudo añadir el producto.'}`);
      } else {
        alert("Error de conexión al servidor.");
      }
    } finally {
      // Solo se desactiva cuando todo lo anterior termina
      setLoading(false);
    }
  };
  //Verificar si el usuario ya ha realizado una valoración
  const [usuariovalorado, setUsuariovalorado] = useState(false);
  useEffect(() => {
    const verificarValoracion = async () => { 
      try {
        const valoraciones = await getValoracionesByIdelem(currentTrack.id);
        if (Array.isArray(valoraciones)) {
          const yaValorado = valoraciones.some(v => v.idusuario === idLoggedIn);
          setUsuariovalorado(yaValorado);
        } else {
          setUsuariovalorado(false);
        }
      } catch (error) {
        console.error("Error al verificar la valoración:", error);
      } finally {
        // Solo se desactiva cuando todo lo anterior termina
        setLoading(false);
      }
    };
      if (token && idLoggedIn && currentTrack?.id != null) {
        verificarValoracion();
      }
  }, [token, idLoggedIn, currentTrack?.id]);

  const [puedeComentar, setPuedeComentar] = useState(false);
  useEffect(() => {
    const verificarSiTieneElemento = async () => {
      try {
        const resultado = await getUsuarioTieneElementoById(token, idLoggedIn);
        if (Array.isArray(resultado)) {
          const tiene = resultado.some(e => e.id === currentTrack.id);
          setPuedeComentar(tiene);
        } else {
          setPuedeComentar(false);
        }
      } catch (error) {
        console.error("Error al verificar si el usuario tiene el elemento:", error);
        setPuedeComentar(false);
      } finally {
        // Solo se desactiva cuando todo lo anterior termina
        setLoading(false);
      }
    };

    if (token && idLoggedIn && currentTrack?.id != null) {
      verificarSiTieneElemento();
    }
  }, [token, idLoggedIn, currentTrack?.id]);

  while (loading) {
    return <Carga mensaje="Cargando información de la canción..." />;
  }
  return (
    <>
      <div id="contenidoCancion" className="p-3 d-flex">
        {/* Columna Izquierda: Imagen, reproductor, precio, valoración, comentarios y botón de comprar */}
        <div id="colIzquierdaMasInfo" className="me-3">
          <div
            className="vinilo-wrapper"
            style={{
              animation: 'rotar 3s linear infinite',
              animationPlayState: girar ? 'running' : 'paused'
            }}
          >
            <img
              className="portada"
              src={`${AMAZON_URL_FOTO}${album.fotoAmazon}`}
              alt="Portada del álbum"
            />
            <i className="fa-solid fa-record-vinyl vinilo-icon"></i>
          </div>
          <div id="reproductor" className="mt-3 p-3 d-flex flex-column align-items-center">
            <div className="reproductorAlineacion mb-3">
              <button type="button" className="btnCancionAnterior" onClick={handlePrev}>
                <i className="fa-solid fa-backward"></i>
              </button>
              <button type="button" className="btnPlay" onClick={togglePlay}>
                <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
              </button>
              <button type="button" className="btnCancionPosterior" onClick={handleNext}>
                <i className="fa-solid fa-forward"></i>
              </button>
              <button type="button" className="btnFavoriteAlbum" onClick={toggleFavorite}>
                {isFavorite ? (
                  <i className="fa-solid fa-heart"></i>
                ) : (
                  <i className="fa-regular fa-heart"></i>
                )}
              </button>
              <audio  ref={audioRef}  src={audioUrl}  preload="metadata"  onTimeUpdate={() => {
                    const current = audioRef.current;
                    if (current?.duration) {
                      const percentage = (current.currentTime / current.duration) * 100;
                      setProgress(percentage);
                      setCurrentTime(current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (audioRef.current?.duration) {
                      setDuration(audioRef.current.duration);
                    }
                  }}
                  onEnded={handleNext} // opcional: pasa automáticamente a la siguiente pista
                />
            </div>
            <div className="barraProgreso d-flex column">
              <div className="tiempoAhora">{formatTime(currentTime)}</div>
              <div className="progress" onClick={handleProgressClick}>
                <div className="progreso" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="duracion">{formatTime(duration)}</div>
            </div>
          </div>
          {primerTrack && (
          <div className="d-flex justify-content-between align-items-center my-3">
            <span className="precio mb-0">{primerTrack.precio}€</span>
            <div className="estrellas">{renderStars(primerTrack.valoracion)}</div>
          </div>
          )}
          {/* Botón de Comprar modificado para abrir el Popup */}
          {!puedeComentar &&(
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-comprar"
              onClick={handleComprarClick}
            >
              Comprar ya
            </button>
              <button
              type="button"
              className="btn btn-anadircesta"
              onClick={handleAnadirACesta}
            >
              Añadir a la cesta
            </button>
          </div> )}
          {currentTrack && (
            <div id="comentarios" className="mb-3 text-start">
              <h3>Comentarios:</h3>
              
              {Array.isArray(primerTrack.comentarios) && primerTrack.comentarios.length > 0 ? (
                primerTrack.comentarios.map((comentario, idx) => (
                  <div key={idx} className="cardComentario mb-2">
                    <div className="cardHeaderComentario mb-2">
                      <div className="usuarioComentario">{comentario.usuario}:</div>
                      <div className="estrellascomentarios">{renderStars(comentario.valoracion)}</div>
                    </div>
                    <div className="cardBodyComentario mb-2">
                      <p>{comentario.comentario}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No hay comentarios.</p>
              )}
            </div>
          )}
        </div>
       
        {/* Columna Derecha: Información de la pista actual y detalles generales del álbum */}
        {currentTrack && (
        <div id="colDerechaMasInfo">
          <div className="tituloCancion">
            <h1>{primerTrack.nombre}</h1>
          </div>
          <div className="nombreArtista">{primerTrack.artistaNombre}</div>
          <div className="descripcionCancion">
            <p>{primerTrack.descripcion}</p>
          </div>
          <div id="etiquetas">
            {generoNombre && <span className="tags me-2">{generoNombre}</span>}
            {subgeneroNombre && <span className="tags me-2">{subgeneroNombre}</span>}
          
          {/*Array.isArray(currentTrack?.tags) &&
            currentTrack.tags.map((tag, idx) => (
              <span key={idx}>{tag}</span>
          ))*/}
          </div>
          <div className="numVentas"> 
            <p>Número de ventas: {currentTrack.numventas}</p> 
          </div>
          {Array.isArray(tracklist) && tracklist.length > 0 && (
          <div id="tracklist" className="mb-3">
            <h3>Lista de reproducción:</h3>
            <ul className="lista list-group">
              {tracklist.map((track, idx) => (
                <li
                  key={track.id || idx}
                  className={`listaTracks list-group-item ${idx === currentTrackIndex ? "active" : ""}`}
                >
                  <div className="numTrack">
                    <small>{track.id || idx + 1}</small>
                  </div>
                  <div className="bloqueTitulo">
                    <h5 className="tituloTrack">{track.nombre}</h5>
                    <small>{track.artistaNombre || "Artista desconocido"}</small>
                  </div>
                  <div className="duracionTrack">
                    <small>{formatTime(track.duration) || "?"}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
        )}
      </div>
      {/* Renderizado condicional del Popup */}
      {showPopup && (
        <Popup 
          precio={currentTrack.price}
          productos={productos}  
          idUsuario={idLoggedIn}
          tokenUsuario={token}
          closePopup={() => setShowPopup(false)}
        />
      )}
    </>
  );
}

export default MasInfoPageAlbum;
