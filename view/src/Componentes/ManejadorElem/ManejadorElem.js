import "./ManejadorElem.css";
import React, { useContext, useEffect, useState } from "react";
import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';

import { deleteElemento, getElementos  } from "./../../ApiServices/ElementosService.js"
import { getCancionesByAlbum } from "./../../ApiServices/CancionesService.js"

import CrearElem from "../CrearElem/CrearElem.js";
import ListaVacia from "../Utiles/ListaVacia/ListaVacia.js";
import PantallaCarga from "../Utiles/PantallaCarga/PantallaCarga.js";
import Aviso from "../Utiles/Aviso/Aviso.js";

const ManejadorElem = ({}) => {
  const { 
    token,
    idLoggedIn
  } = useContext(UsuarioContext);

  const [elementosCreados, setElementosCreados] = useState([]);
  const [cancionesAlbum, setCancionesAlbum] = useState([]);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [expandido, setExpandido] = useState({});
  const [cargando, setCargando] = useState(false); //PANTALLA DE CARGA
  const [mostrarModal, setMostrarModal] = useState(false); // MODAL POR SEGURIDAD
  const [itemABorrar, setItemABorrar] = useState(null);
  const [notificacion, setNotificacion] = useState(null);

  // Función para cargar los elementos desde la API
  const fetchData = async () => {
    try {
      setCargando(true);
      // 1. Traemos TODO
      const todos = await getElementos(token);
      // 2. Filtramos los MÍOS (del usuario logueado)
      const misElementos = todos.filter(e => e.artista && e.artista.id === idLoggedIn);
      
      setElementosCreados(misElementos);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  };

  // useEffect para cargar los datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);
  
    const obtenerCanciones = async (idAlbum) => {
      try {
        const cancionesAlb = await getCancionesByAlbum(idAlbum);
        setCancionesAlbum(prev => ({
          ...prev,
          [idAlbum]: cancionesAlb
        }));
      } catch (error) {
        console.error("Error al cargar canciones:", error);
      }
    };
    
  const verCancionesAlbum = (id) => {
    setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));
    obtenerCanciones(id);
    console.log("CancionesAlbum", cancionesAlbum)
  };

  const manejarCrearNuevo = () => {
    setItemSeleccionado(null);
    setMostrarCrear(true);
  };

  const manejadorEditar = (item) => {
    setItemSeleccionado(item);
    setMostrarCrear(true);    
  }; 

  const confirmacionBorrar = (item) => {
    setItemABorrar(item); 
    setMostrarModal(true); 
  };

  const borrarElementoConfirmado = async () => {
    if (!itemABorrar) return; //si no hay elemento a borrar
    try {
      await deleteElemento(token, itemABorrar);
      await fetchData();
    } catch (error) {
      console.error("Error al borrar el elemento:", error);
    } finally {
      setMostrarModal(false);
      setItemABorrar(null);
    }
  };

  const cancelarFormulario = () => {
    setItemSeleccionado(null);
    setMostrarCrear(false);
    fetchData();
  };

  // Cuando recibes resultado del hijo:
  const manejarResultado = ({ codigo, mensaje }) => {
    setNotificacion({ mensaje, tipo: codigo === 1 ? 'exito' : codigo === 2 ? 'info' : 'error' });
    setMostrarCrear(false); // Cierra el formulario
    setItemSeleccionado(null); // Limpia selección previa
    fetchData(); // Recarga la lista
  };

  return (
    <div id="manejadorElem">
      {cargando?(<PantallaCarga mensaje="Cargando elementos..." />):
      (<>
        {!mostrarCrear ? (
          <>
            <h1>Mis Elementos</h1>
            <button id="nuevoElem" onClick={manejarCrearNuevo}>
              + Crear nuevo elemento
            </button>

            {elementosCreados.length === 0?(
              <ListaVacia mensaje ="No hay elementos creados"></ListaVacia>
            ):(
              <div id="listaElementos">
                {elementosCreados.filter(elem => elem.esAlbum).map((elem) => (
                  <div key={elem.id} className="elemento">
                    <div className="cabeElem">
                      <h3><i className="fa-solid fa-rectangle-list"></i> {elem.nombre}</h3>
                      <div>
                        {elem.esAlbum && (
                            <button className="botonCanAlb"  onClick={() => verCancionesAlbum(elem.id)}>
                            {expandido[elem.id] ? "Ocultar canciones" : "Ver canciones"}
                            </button>
                        )}
                        <button className="editarElem" onClick={() => manejadorEditar(elem.id)}>Editar</button>
                        <button className="borrarElem" onClick={() => confirmacionBorrar(elem.id)}>Borrar</button>
                      </div>
                    </div>

                    {elem.esAlbum && expandido[elem.id] && (
                      <div className="canciones">
                        {cancionesAlbum[elem.id]?.map((can, index) => (
                          <div key={can.id} className="cardCancion">
                            <span>{index + 1}. {can.nombre}</span>
                            <div>
                                <button className="editarCanc" onClick={() => manejadorEditar(elem.id)}>Editar</button>
                                <button className="borrarCanc" onClick={() => confirmacionBorrar(elem.id)}>Borrar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {elementosCreados.filter(elem => !(elem.esAlbum) && elem.album === null).map((elem) => (
                  <div key={elem.id} className="elemento">
                    <div className="cabeElem">
                      <h3><i className="fa-solid fa-record-vinyl"></i> {elem.nombre}</h3>
                      <div>
                        <button className="editarElem" onClick={() => manejadorEditar(elem.id)}>Editar</button>
                        <button className="borrarElem" onClick={() => confirmacionBorrar(elem.id)}>Borrar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="crear-formulario-contenido">
            <button className="volver-btn" onClick={cancelarFormulario}>← Volver a la lista</button>
            <CrearElem datos={itemSeleccionado} crearModo={!itemSeleccionado} manejarResultado={manejarResultado} />
          </div>
        )}
      </>)}
      
      {mostrarModal && (
        <div className="modal">
          <div className="modal-contenido">
            <p>¿Está seguro de que quiere eliminar este elemento? Si es un álbum, también se eliminarán sus canciones.</p>
            <div className="modal-botones">
              <button className="button2" onClick={borrarElementoConfirmado}>Sí, eliminar</button>
              <button className="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {notificacion && (
        <Aviso
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onClose={() => setNotificacion(null)}
        />
      )}
    </div>
  );
};

export default ManejadorElem;
