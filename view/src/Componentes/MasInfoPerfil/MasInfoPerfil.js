import './MasInfoPerfil.css';
import React, { useContext, useEffect, useState } from "react";
import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';
import { useLocation, useNavigate } from 'react-router-dom';

import { AMAZON_URL_FOTO, AMAZON_URL_DEFAULT } from '../../config.js';

import { getElementos } from '../../ApiServices/ElementosService';
import { getCancionesByAlbum } from "./../../ApiServices/CancionesService.js"
import { postFavorito, deleteFavorito, getFavoritosByIds } from "./../../ApiServices/UsuarioService.js"
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga.js';

const MasInfoPerfil = () => {
    const location = useLocation();
    const artista = location.state; // Aquí recibes el artista pasado

    const [elementosCreados, setElementosCreados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [cancionesAlbum, setCancionesAlbum] = useState({});
    const [expandido, setExpandido] = useState({});
    const { isLoggedIn, idLoggedIn, token } = useContext(UsuarioContext);
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    // Función para cargar los elementos del artista
    const fetchData = async () => {
        try {
            setCargando(true);
            //Todos los elementos
            const todosLosElementos = await getElementos(null);
            console.log("Todos los elementos cargados:", todosLosElementos);
            //Obtener los elementos del artista
            const filtrados = todosLosElementos.filter(e => e.artista && e.artista.id === artista.id);
            
            setElementosCreados(filtrados);

            console.log("Elementos del artista cargados:", filtrados);
        } catch (error) {
            console.error("Error al cargar elementos del artista:", error);
        } finally {
            setCargando(false);
        }
    };

    // Función para cargar canciones de un álbum específico
    const obtenerCanciones = async (idAlbum) => {
        try {
        const cancionesAlb = await getCancionesByAlbum(idAlbum);
        setCancionesAlbum(prev => ({
            ...prev,
            [idAlbum]: cancionesAlb
        }));
        } catch (error) {
        console.error("Error al cargar canciones del álbum:", error);
        }
    };

    // Función para expandir o contraer álbumes
    const verCancionesAlbum = (idAlbum) => {
        setExpandido(prev => ({
        ...prev,
        [idAlbum]: !prev[idAlbum]
        }));
        obtenerCanciones(idAlbum);
    };

    useEffect(() => {
        const verificarFavorito = async () => {
            if (isLoggedIn && artista?.id != null) {
                try {
                    await getFavoritosByIds(token, idLoggedIn, artista.id);
                    setIsFavorite(true);
                } catch (error) {
                    setIsFavorite(false);
                }
            }
        };
        verificarFavorito();
    }, [token, isLoggedIn, idLoggedIn, artista?.id]);

    // useEffect para cargar elementos cuando se monta el componente
    useEffect(() => {
        if (artista?.id) {
          fetchData();
        }
    }, [artista]);

    const verMasElemento = (item, tipo) => {
        //console.log("MANDO", item)
        if(tipo === 1){
          navigate("/masInfoAlbum", { state: item });
        }else{
          navigate("/masInfo", { state: item });
        }
      };
    
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

    
    const toggleFavorite = async () => {
        const cambioEstado = !isFavorite
        setIsFavorite(cambioEstado);

        if (isLoggedIn && artista?.id != null) {
            try {
                if (cambioEstado) {
                    const relacion = {
                      usuario_id: idLoggedIn,
                      id_artista: artista.id,
                    };

                    await postFavorito(token, relacion);
                } else {
                    await deleteFavorito(token, idLoggedIn, artista.id);
                }
            } catch (error) {
              console.error("❌ Error al actualizar favorito:", error);
            }
        }
    };

    if (!artista) return <div>No se ha encontrado el artista.</div>;

  return (
    <div id="masInfoPerfil">
      <div className="perfil-info">
        <h1 className={artista.esNovedad?"text-esNovedad":""}>
            {artista.nombre}
            {isLoggedIn &&(
                <button type="button" className="btnFavoritePer" onClick={toggleFavorite}>
                  {isFavorite ? (
                    <i className="fa-solid fa-heart"></i>
                  ) : (
                    <i className="fa-regular fa-heart"></i>
                  )}
                </button>
            )}    
        </h1>
        <img
          src={artista.fotoAmazon && artista.fotoAmazon !== "null"
            ? `${AMAZON_URL_FOTO}${artista.fotoAmazon}`
            : AMAZON_URL_DEFAULT}
          alt="Foto del artista"
          className="card-img-top card-img-circle"
        />
        <div className='puntuacion mb-1'>{renderStars(artista.valoracion)}</div>
        <div className="desc">
            <p>{artista.descripcion}</p>
        </div>
        <div className="anio">
            <p className="mb-0">Inicio de la Carrera: {new Date(artista.fechaCrea).toLocaleDateString()}</p>
        </div>
        <div className="oye">
            <p>Número de Oyentes: {artista.oyentes}</p>
        </div>
        <div id="etiquetas">
        {/* Accedemos a la propiedad .nombre del objeto género */}
          <span className="tags me-2">{artista.genero?.nombre || "Sin género"}</span>
        </div>
      </div>

      <div id="listaElementos">
        <h3>Elementos del artista:</h3>
        {cargando ? (
          <PantallaCarga />
        ) : (
          <div className="canciones-listado">
            {elementosCreados.length === 0 ? (
              <p className="text-muted">Este artista aún no creo ningún elemento.</p>
            ) : (
                <div id="listaElementos">
                {elementosCreados.filter(elem => elem.esAlbum).map((elem) => (
                  <div key={elem.id} className="elemento">
                    <div className="cabeElem">
                      <h4><i className="fa-solid fa-rectangle-list"></i> {elem.nombre}</h4>
                      <div>
                        <button className="botonCanAlb" onClick={() => verCancionesAlbum(elem.id)}>
                          {expandido[elem.id] ? "Ocultar canciones" : "Ver canciones"}
                        </button>
                        <button className="verMasElem" onClick={() => verMasElemento(elem,1)}>Ver más</button>
                      </div>
                    </div>
              
                    {elem.esAlbum && expandido[elem.id] && (
                      <div className="canciones">
                        {cancionesAlbum[elem.id]?.map((can, index) => (
                          <div key={can.idelemento} className="cardCancion">
                            <span>{index + 1}. {can.nombre}</span>
                            <div>
                              <button className="verMasCanc" onClick={() => {verMasElemento(elementosCreados.find(elem => elem.id === can.idelemento), 2);}}>Ver más</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              
                {elementosCreados.filter(elem => !elem.esAlbum && elem.album === null).map((elem) => (
                  <div key={elem.id} className="elemento">
                    <div className="cabeElem">
                      <h4><i className="fa-solid fa-record-vinyl"></i> {elem.nombre}</h4>
                      <div>
                        <button className="verMasElem" onClick={() => verMasElemento(elem,2)}>Ver más</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasInfoPerfil;
