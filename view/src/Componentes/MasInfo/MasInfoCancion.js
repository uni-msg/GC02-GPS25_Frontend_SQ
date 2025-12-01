import './MasInfoCancion.css';

import React, { useState, useRef, useEffect, useContext, useMemo} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { getElementos, getValoracionesByIdelem, postValora, getLetraById} from '../../ApiServices/ElementosService';
import { getGeneroById} from '../../ApiServices/GeneroService.js';
import { getUsuarioById, getFavoritosByIds, getTieneByIds, getDeseaByIds, postDesea, deleteDesea, postFavorito, deleteFavorito} from '../../ApiServices/UsuarioService.js';
import { postElementoCesta } from "../../ApiServices/CestaService";
import { registrarReproduccion } from '../../ApiServices/EstadisticasService.js'; 

import Popup from '../MetodoPago/MetodoPago.js';
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga.js';
import { URL_FOTO, URL_MP3 } from '../../config.js';
import { UsuarioContext } from "../InicioSesion/UsuarioContext";



function MasInfo() {
  // Obtenemos el objeto pasado por la navegación
  const navigate = useNavigate();
  const location = useLocation();
  //const song = location.state || {};
  const song = useMemo(() => location.state || {}, [location.state]);
  const { idLoggedIn, token } = useContext(UsuarioContext);


  // Resto de estados y lógica del componente...
  const [girar, setGirar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const audioUrl = `${URL_MP3}${song.urlFoto.replace(/\.[^/.]+$/, "")}.mp3`;
  const audioRef = useRef(new Audio(audioUrl));
  const [comentarios, setComentarios] = useState([]);

  // Función para alternar reproducción/pausa
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setGirar(false);
    } else {
      audioRef.current.play();
      setGirar(true);
      if (token && idLoggedIn && song?.id) {
          console.log("▶️ Botón Play pulsado. Registrando reproducción...");
          
          // Enviamos '120' segundos fijos (o lo que quieras) para cumplir con la API
          registrarReproduccion(token, idLoggedIn, song.id, 120) 
            .catch(err => console.error("Error registrando play:", err));
      }
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const newAudio = new Audio(`${URL_MP3}${song.urlFoto.replace(/\.[^/.]+$/, "")}.mp3`);
    
    if (audioRef.current) {
      audioRef.current.pause(); // Para parar la anterior
    }
    
    audioRef.current = newAudio;
    setIsPlaying(false); // Opcional: resetea el estado de "isPlaying"
  
    const audioElement = audioRef.current;
  
    const updateProgress = () => {
      if (audioElement.duration) {
        const percentage = (audioElement.currentTime / audioElement.duration) * 100;
        setProgress(percentage);
        setCurrentTime(audioElement.currentTime);
      }
    };
  
    const setAudioDuration = () => {
      setDuration(audioElement.duration);
    };
  
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', setAudioDuration);
  
    return () => {
      audioElement.pause();
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, [song]); // <- AHORA depende de song
  

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
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

  const handleComprarClick = () => {
    setShowPopup(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  //DESEA 
  const [isDeseado, setIsDeseado] = useState(false);
  const toggleDeseado = async () => {
    const nuevoEstado = !isDeseado;
    setIsDeseado(nuevoEstado);

    if (token && idLoggedIn && song?.id != null) {
      try {
        if (nuevoEstado) {
          const relacion = {
            idusuario: idLoggedIn,
            idelemento: song.id,
          };
          await postDesea(token, relacion);
        } else {
          await deleteDesea(token, idLoggedIn, song.id);
        }
      } catch (error) {
        setIsDeseado(!nuevoEstado);
        console.error("Error al actualizar favorito:", error);
      }
    }
  };

  //FAVORITO 
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = async () => {
    const nuevoEstado = !isFavorite;
    setIsFavorite(nuevoEstado);

    if (token && idLoggedIn && song?.id != null) {
      try {
        if (nuevoEstado) {
          const relacion = {
            idusuario: idLoggedIn,
            idelemento: song.id,
            tipo: 1
          };
          await postFavorito(token, relacion);
        } else {
          await deleteFavorito(token, idLoggedIn, song.id, false);
        }
      } catch (error) {
        setIsFavorite(!nuevoEstado);
        console.error("Error al actualizar favorito:", error);
      }
    }
  };

  //verificar favorito 
  useEffect(() => {
    const verificarFavorito = async () => {
      if (token && idLoggedIn && song?.id != null) {
        try {
          const yaFavorito = await getFavoritosByIds(token, idLoggedIn,song.id, false)
          const yaDeseado = await getDeseaByIds(token, idLoggedIn,song.id)
          
          setIsFavorite(yaFavorito);
          setIsDeseado(yaDeseado);
        } catch (error) {
          console.error("Error al verificar si es favorito:", error);
        }
      }
    };
  
    verificarFavorito();
  }, [token, idLoggedIn, song?.id]); // Se ejecuta cuando cambie el token, id o la canción

  //Backend 
  const [generoNombre, setGeneroNombre] = useState('');
  const [subgeneroNombre, setSubgeneroNombre] = useState('');
  const [productos, setProductos] = useState([{id:null}]);

  const [nombreArtista, setNombreArtista] = useState("Cargando...");  //nuevo

  //AÑADIR A CESTA

  const handleAnadirACesta = async () => {
    try {
      if (!token || !idLoggedIn) {
        alert("Debes iniciar sesión para añadir a la cesta.");
        return;
      }


      console.log("en song:", song);
      console.log("usuario id:", idLoggedIn);
      console.log("elemento id:", song.id);

      await postElementoCesta(token, {
        idusuario: idLoggedIn,
        idelemento: song.id,
      });



      alert("¡Producto añadido a la cesta! 🛒");
    } catch (error) {
      console.error("Error al añadir el producto a la cesta:", error);
      console.log("El token es:", token);

      if (error.response) {
        console.error("Respuesta del backend:", error.response.data);
        alert(`Error: ${error.response.data.detail || 'No se pudo añadir el producto.'}`);
      } else {
        alert("Error de conexión al servidor.");
      }
    }
  };

  //LETRA DE CANCION 
  const [letra, setLetra] = useState();
 
  //CAJA COMENTARIOS 
  const [comentario, setComentario] = useState('');
  const [valoracion, setValoracion] = useState(0);

  const handleEnviarComentario = async () => {
    try {
      const nuevoComentario = {
        idusuario: idLoggedIn,
        idelemento: song.id,
        valoracion,
        comentario,
      };
      await postValora(token, nuevoComentario);

      alert('Comentario enviado con éxito');
      setComentarios((prev) => [
        ...prev,
        { usuario: "Tú", valoracion, comentario }
      ]);
      setComentario('');
      setValoracion(0);
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      alert("Error al enviar el comentario");
    }
  };

  //Verificar si el usuario ya ha realizado una valoración
  const [usuariovalorado, setUsuariovalorado] = useState(false);
  useEffect(() => {
    const verificarValoracion = async () => { 
      try {
        const valoraciones = await getValoracionesByIdelem(song.id);
        if (Array.isArray(valoraciones)) {
          const yaValorado = valoraciones.some(v => v.idusuario === idLoggedIn);
          setUsuariovalorado(yaValorado);
        } else {
          setUsuariovalorado(false);
        }
      } catch (error) {
        console.error("Error al verificar la valoración:", error);
      }
    };
      if (token && idLoggedIn && song?.id != null) {
        verificarValoracion();
      }
  }, [token, idLoggedIn, song?.id]);

  const [puedeComentar, setPuedeComentar] = useState(false);

  useEffect(() => {
    const verificarSiTieneElemento = async () => {
      try {
        const tiene = await getTieneByIds(token, idLoggedIn, song.id);
        setPuedeComentar(tiene);
      } catch (error) {
        console.error("Error al verificar si el usuario tiene el elemento:", error);
        setPuedeComentar(false);
      }
    };

    if (token && idLoggedIn && song?.id != null) {
      verificarSiTieneElemento();
    }
  }, [token, idLoggedIn, song?.id]);

  // Canciones relacionadas
  const [relacionadas, setRelacionadas] = useState([]);

  // Ver más click 
  const vermasClick = (cancion) => {
    navigate("/masInfo", { state: cancion });
  };

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (song?.idGenero) {
          const genero = await getGeneroById(song.idGenero);
          setGeneroNombre(Array.isArray(genero) ? genero[0]?.name : genero.name);
        }
        //Obtener subgenero
        if (song.genero?.nombre) {
             setGeneroNombre(song.genero.nombre);
        } else if (song.genero?.name) {
             setGeneroNombre(song.genero.name);
        }

        if (song.subgenero?.nombre) {
             setSubgeneroNombre(song.subgenero.nombre);
        } else if (song.subgenero?.name) {
             setSubgeneroNombre(song.subgenero.name);
        }

        if (song?.id) {
          setProductos(prevProductos => [
            { id: song.id } 
          ]);
        //ARTISTA
        if (song.artista) {
            // Probamos las propiedades que suelen tener el nombre
            const nombre = song.artista.nombreusuario || song.artista.nombrereal || "Artista Desconocido";
            setNombreArtista(nombre);
        } else {
            // Si el objeto artista viene null, entonces (opcionalmente) podrías intentar buscarlo o dejarlo así
            setNombreArtista("Artista Desconocido");
        }

          // si es correcto tenemos el id de la cancion y con el obtendremos la letra de la cancion 
          // si no tiene letra devolvera letra null
          const letraCan = await getLetraById(song.id);
          setLetra(letraCan);
  
          // const comentariosAPI = await getValoracionesByIdelem(song.id);
          // const comentariosConNombres = await Promise.all(
          //   (comentariosAPI || []).map(async (valoracion) => {
          //     try {
          //       const usuario = await getUsuarioById(token, valoracion.idusuario);
          //       return {
          //         ...valoracion,
          //         usuario: usuario.nombreusuario || `Usuario ${valoracion.idusuario}`,
          //       };
          //     } catch {
          //       return {
          //         ...valoracion,
          //         usuario: `Usuario ${valoracion.idusuario}`,
          //       };
          //     }
          //   })
          // );
          // setComentarios(comentariosConNombres);
  
          const todos = await getElementos(token);
          const filtradas = todos.filter(
            (el) => el.idGenero === song.idGenero && el.id !== song.id && el.precio !== null
          );
          setRelacionadas(filtradas);
        }
  
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        // Solo se desactiva cuando todo lo anterior termina
        setLoading(false);
      }
    };
  
    cargarDatos();
  }, [song, token]);

  useEffect(() => {
    setComentarios([]);   
  }, [song.id]);        
  //COMENTARIOS 
  useEffect(() => {
  const cargarComentarios = async () => {
    try {
      if (!song?.id) return;

      const comentariosAPI = await getValoracionesByIdelem(song.id);

      const comentariosFiltrados = (comentariosAPI || []).filter(
      (c) => c.idelem === song.id
    );

      const comentariosConNombres = await Promise.all(
        (comentariosFiltrados || []).map(async (valoracion) => {
          try {
            const usuario = await getUsuarioById(token, valoracion.iduser);
            return {
              ...valoracion,
              usuario: usuario?.nombreusuario || `Usuario ${valoracion.iduser}`,
            };
          } catch (err) {
            return {
              ...valoracion,
              usuario: `Usuario ${valoracion.iduser}`,
            };
          }
        })
      );

      setComentarios(comentariosConNombres);
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    }
  };

  cargarComentarios();
}, [song?.id, token]);

  useEffect(() => {
    console.log("objeto letra es: ", letra)
  }, [letra]);
  
  while (loading) {
    return <PantallaCarga mensaje="Cargando información de la canción..." />;
  }

  return (
    <>
      <div id="contenidoCancion" className="p-3 d-flex">
        {/* Columna Izquierda: imagen, reproductor, precio, etc. */}
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
              src={`${URL_FOTO}${song.urlFoto}`}
              alt="Portada del álbum"
            />
            <i className="fa-solid fa-record-vinyl vinilo-icon"></i>
          </div>

          {/* Reproductor */}
          <div id="reproductor" className="mt-3 p-3 d-flex flex-column align-items-center">
            <div className="filaPlayFav w-100 mb-3">
              <button type="button" className="btnPlay" onClick={togglePlay}>
                <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
              </button>
              {token &&( 
                <>
                  <button type="button" className="btnFavorite" onClick={toggleFavorite}>
                    {isFavorite ? (
                      <i className="fa-solid fa-star"></i>
                    ) : (
                      <i className="fa-regular fa-star"></i>
                    )}
                  </button>
                  <button type="button" className="btnDeseado" onClick={toggleDeseado}>
                    {isDeseado ? (
                      <i className="fa-solid fa-heart"></i>
                    ) : (
                      <i className="fa-regular fa-heart"></i>
                    )}
                  </button>
                </>
              )}
            </div>
            <div className="barraProgreso d-flex column">
              <div className="tiempoAhora">{formatTime(currentTime)}</div>
              <div className="progress" onClick={handleProgressClick}>
                <div className="progreso" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="duracion">{formatTime(duration)}</div>
            </div>
          </div>

          {/* Precio y valoración */}
          <div className="d-flex justify-content-between align-items-center my-3">
            <span className="precio mb-0">{song.precio}€</span>
            <div className="estrellas">{renderStars(song.valoracion)}</div>
          </div>

          {/* Botón de Comprar */}
          {token && !puedeComentar &&(
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

          {/* Comentarios */}
          <div id="comentarios" className="mb-3 text-start">
            {token && puedeComentar && !usuariovalorado && (
              <div className="comentario-container">
                <h3>Deja tu comentario</h3>
                <textarea
                  className="textarea-comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe tu comentario aquí..."
                />

                <div>
                  <label>Valoración:</label>
                  <div className="rating-container d-flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i
                        key={i}
                        className={
                          i < valoracion
                            ? "bi bi-file-music-fill text-info my-icon"
                            : "bi bi-file-music text-info my-icon"
                        }
                        onClick={() => setValoracion(i + 1)}
                      />
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary mt-2" onClick={handleEnviarComentario}>
                  Enviar comentario
                </button>
              </div>
            )}
            <h3>Comentarios:</h3>
            {comentarios.length > 0 ? (
              comentarios.map((comentario, idx) => (
                <div key={idx} className="cardComentario mb-2">
                  <div className="cardHeaderComentario mb-2">
                    <div className="usuarioComentario">{comentario.usuario || "Anónimo"}:</div>
                    <div>{renderStars(comentario.valoracion)}</div>
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
        </div>



        {/* Columna Derecha: información de la canción */}
        <div id="colDerechaMasInfoCancion">
          <div className="tituloCancion">
            <h1>{song.nombre}</h1>
          </div>
          <div className="nombreArtista">
            {/*{song.artista}*/}
            {/*song.artista?.nombreusuario || song.artista?.nombrereal || (typeof song.artista === 'string' ? song.artista : "Artista Desconocido")^*/}
            {nombreArtista}
          </div>
          <div className="descripcionCancion">
            <p>{song.descripcion}</p>
          </div>
          <div className="anio">
            <p>Año de lanzamiento: {song.fechacrea ? new Date(song.fechacrea).getFullYear() : 'Desconocido'}</p>
          </div>
          <div className="numVentas">
            <p>Número de ventas: {song.numventas}</p>
          </div>
          <div id="etiquetas">
            {generoNombre && <span className="tags me-2">{generoNombre}</span>}
            {subgeneroNombre && <span className="tags me-2">{subgeneroNombre}</span>}
          </div>

          {/* LETRA DE LA CANCION */ }
          <div id="letraCancion" className=" mb-3">
            <h3> Letra: </h3>
            {letra?.letra ? ( // necesario emplear la etiqueta PRE ya que trabaja respetando los saltos de linea
              <pre id="letra-texto">{letra.letra}</pre> 
            ) : (
              <p className="text-muted">Esta canción actualmente no cuenta con su letra.</p>
            )}
        </div>

          <div id="cancionesRelacionadas" className="mb-3">
            <h3>Canciones Relacionadas:</h3>
            {relacionadas.length > 0 ? (
              <div className="d-flex flex-wrap">
                {relacionadas.map((cancion, idx) => (
                  <div key={idx} className="card m-2" style={{ width: "16rem" }}>
                    <div
                      className="vinilo-wrapperelacionadas"
                    >
                      <img
                        src={`${URL_FOTO}${cancion.urlFoto}`}
                        className="cardCancionRelacionada"
                        alt={cancion.nombre}
                      />
                      <i className="fa-solid fa-record-vinyl vinilo-icon"></i>
                    </div>

                    <div className="card-body">
                      <h5 className="card-title">{cancion.nombre}</h5>
                      <div className="cardboton">
                      <button
                        type="button"
                        className="botonVerMasColor"
                        onClick={() => vermasClick(cancion)}
                      >
                        Ver más
                      </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No hay canciones relacionadas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Popup de compra */}
      {showPopup && (
        <Popup
          precio={song.precio}
          productos={productos}  
          idUsuario={idLoggedIn}
          tokenUsuario={token}
          closePopup={() => setShowPopup(false)}
        />
      )}
    </>
  );
}

export default MasInfo;