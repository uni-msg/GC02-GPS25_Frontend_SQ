import './Perfil.css';

import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Lista from "./../ListaFiltros/Lista.js";
import ManejadorElem from "../ManejadorElem/ManejadorElem.js";
import Carga from '../Utiles/PantallaCarga/PantallaCarga.js';
import logo from './../../Recursos/elementoDefecto.png';

import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';
import { subirArchivo } from "./../../ApiServices/FileSerive";
import '../InicioSesion/firebaseConfig.js';
import { getAuth, signOut } from "firebase/auth";
import { URL_FOTO, CLOUD_URL_DEFAULT } from '../../config.js';

import { getFavoritosById, putUsuario ,getUsuarioTieneElementoById, getUsuarioDeseaElementoById } from "./../../ApiServices/UsuarioService.js"

function Perfil({ idMenu }) {
    const [menuPerfilActivo, setMenuPerfilActivo] = useState(1);
    const [masDatos, setMasDatos] = useState(true);
    const [editar, setEditar] = useState(false);
    useEffect(() => {
        setMenuPerfilActivo(idMenu)
    }, [idMenu])

    //para cerrar sesión
    const [mostrarModal, setMostrarModal] = useState(false);
    const auth = getAuth();
    const navigate = useNavigate();
    //datos del usuarip
    const {
        token,
        idLoggedIn, setIdLoggedIn,
        setIsLoggedIn,
        contrasenia,
        nombreUsuario, setNombreUsuario,
        correo,
        descripcion, setDescripcion,
        esArtista,
        fotoAmazon, setFotoAmazon,
        esNovedad,
        oyentes,
        valoracion,
        logoutData
    } = useContext(UsuarioContext);

    const [formData, setFormData] = useState({
        nombreusuario: nombreUsuario,
        descripcion: descripcion,
        fotoAmazon: fotoAmazon, //foto de perfil
        fotoFile: null, // <-- inicializar explícitamente
    });

    const actualizoDatos = async (e) => {
        e.preventDefault();
        console.log("DATOS :", formData);
        setEditar(false); // cierra edición después de guardar

        try {
            if (formData.descripcion !== descripcion || formData.fotoFile instanceof File || formData.nombreusuario !== nombreUsuario) {
                const urlCloud = `perfil_${idLoggedIn}`+'_' + new Date().toISOString().slice(0, 10).replace(/-/g, '');

                const originalFile = formData['fotoFile'];
                const extension = originalFile.name.split('.').pop();
                const newFileName = `${urlCloud}.${extension}`;
                const renamedFile = new File([originalFile],newFileName, {
                    type: originalFile.type,
                });
                
                //put de usuario
                const elementoData = {
                    id: idLoggedIn,
                    nombreusuario: formData.nombreUsuario,
                    descripcion: formData.descripcion,
                    rutafoto: newFileName //foto de perfil
                };

                const result = await putUsuario(token, elementoData)
                const subidaArchivo = await subirArchivo(renamedFile, "fotos/", urlCloud); 

                //se pudo realizar, set de esos valores
                setDescripcion(formData.descripcion)
                setFotoAmazon(newFileName)
                setNombreUsuario(formData.nombreusuario)
                console.log("Usuario actualizado correctamente:", result);
            } else {
                console.log("No hay cambios que guardar.");
            }
        } catch {
            alert("error al envio de datos")
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            console.log("Sesión cerrada");
            setIdLoggedIn(null);
            setIsLoggedIn(false);
            logoutData();
            setMostrarModal(false); // cerrar el modal después de cerrar sesión
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

    // MANEJO DE ELMENTOS PROPIOS DEL PERFIL, LOS TRAIGO Y YA SE VERA QUE SE MOSTRARA, SE MANDARA AL ELEMENTO Y ESTE LO MANEJA PARA MAS REUTILIZACION
    // SE REALIZARA UNA LLAMADA PRINCIPAL CON USEEFFECT PARA TRAER TODOS LOS DATOS
    const [elementosTiene, setElementosTiene] = useState([]);
    const [elementosDeseo, setElementosDeseo] = useState([]);
    const [artFav, setArtFav] = useState([]);
    const [loading, setLoading] = useState(true);
    const initialPreview = formData.fotoAmazon && formData.fotoAmazon !== "null" ? `${URL_FOTO}${formData.fotoAmazon}` : CLOUD_URL_DEFAULT;
    const [preview, setPreview] = useState(initialPreview);
    const inputRef = useRef(null);
    const [error, setError] = useState(""); // Estado para manejar errores

    useEffect(() => {
        const newPreview = formData.fotoAmazon && formData.fotoAmazon !== "null"
            ? `${URL_FOTO}${formData.fotoAmazon}`
            : CLOUD_URL_DEFAULT;

        setPreview(newPreview);
    }, [formData.fotoAmazon]);


    const clicPort = () => {
        inputRef.current.click();
    };

    const cambioPortada = (e) => {
        const file = e.target.files[0];
        if (file) { //si hay imagen
            const validTypes = ["image/jpeg", "image/png", "image/gif"]; // comprueba los tipos validos
            if (!validTypes.includes(file.type)) {
                setError("Por favor, selecciona una imagen válida (JPEG, PNG, GIF).");
                return;
            }

            setFormData({ ...formData, fotoFile: file }); //copia el formualrio de dato entero menos la
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // llamaremos de manera asincrona (ya que es con promesas) a los endpoint del fastapi de los datos
                const [tiene, desea, art] = await Promise.all([ //LLAMADAS EN PARALELO, LA RESPUESTA MAS TARDIA QUITA EL SINCRONO
                    getUsuarioTieneElementoById(token, idLoggedIn),
                    getUsuarioDeseaElementoById(token, idLoggedIn),
                    getFavoritosById(token, idLoggedIn),
                ]);
                setElementosTiene(tiene);
                setElementosDeseo(desea);
                setArtFav(art);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                //aqui ya se podria mostrar lo que sea, traemos los datos y mostramos una pantalla de carga
                setLoading(false);
            }
        };
        fetchData();
    }, [idLoggedIn, token]); //antes cualquier cambio se revisa, la base de dato se actualiza cualquier momento

    return (
        <div id='perfil'>
            <div id='headerPerfil'>
                <form id='cardPerfil' className="card" onSubmit={actualizoDatos}>
                    <div id="fotoPerfilName">
                        <div id="fotoCrearElem">
                            <img src={preview} className={`card-img-top ${esArtista ? "bordeArt" : ""}  ${esNovedad ? "bordeNovedad" : ""}`} alt="foto de perfil" {...(editar ? { onClick: clicPort } : {})}/>
                            <input type="file" accept="image/*" name="fotoFile" style={{ display: "none" }} ref={inputRef} onChange={cambioPortada} />
                        </div>
                        <div>
                            <label htmlFor="fname"> User Name </label>
                            <input type="text" id="fname" name="fname" value={formData.nombreusuario} onChange={(e) => setFormData({ ...formData, nombreusuario: e.target.value })} disabled={!editar} />
                        </div>
                        <>
                            {!editar && <button type="button" onClick={() => (editar) ? setEditar(false) : setEditar(true)}> Editar </button>}
                            {editar && <button type="submit">Guardar</button>}
                        </>
                    </div>
                    <div id="desc">
                        <label htmlFor="descDatos"> Descripcion </label>
                        <textarea type="text" id="descDatos" name="descDatos" maxLength={256}
                            value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            disabled={!editar} />
                    </div>
                    <div id="correoCont" className={` ${(masDatos) ? "oculto" : ""}`}>
                        <label for="correo"> Correo </label>
                        <input type="email" id="correo" name="correo" maxLength={30} value={correo} disabled />
                    </div>
                    <div id="passCont" className={` ${(masDatos) ? "oculto" : ""}`}>
                        <label htmlFor="pass"> Contraseña </label>
                        <input type="password" id="pass" name="pass" maxLength={25} value={contrasenia} disabled />
                        <i className={`fa-solid fa-eye-slash disabled `} ></i>
                    </div>
                    <div id="visaCont" className={` ${(masDatos) ? "oculto" : ""}`}>
                        <label htmlFor="visa"> Visa </label>
                        <div>
                            <input type="password" id="visaOculto" name="visaOculto" maxLength={15} value="1234-1234-1234" disabled />
                            <input type="text" id="visaFin" name="visaFin" maxLength={5} value="-1234" disabled />
                            <input type="password" id="codVisa" name="codVisa" maxLength={3} value="678" disabled />
                        </div>
                        <i className={`fa-solid fa-credit-card disabled `}></i>
                    </div>
                    {esArtista &&
                        <>
                            <div id="oyenCont" className={` ${(masDatos) ? "oculto" : ""}`}>
                                <label htmlFor="oyentes"> Oyentes </label>
                                <input type="number" id="oyentes" name="oyentes" value={oyentes} disabled />
                            </div>
                            <div id='valoracion' className={` ${(masDatos) ? "oculto" : ""}`}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <i
                                        key={i}
                                        className={
                                            i < valoracion
                                                ? "bi bi-file-music-fill text-info my-icon" // Icono lleno
                                                : "bi bi-file-music text-info my-icon"      // Icono vacío
                                        }
                                    />
                                ))}
                            </div>
                        </>}
                    <button id="masInfo" type="button"
                        className={` ${(!masDatos) ? "masInfoActivo" : ""}`}
                        onClick={() => { (masDatos) ? setMasDatos(false) : setMasDatos(true) }}
                    >
                        Mas Datos <i className="fa-solid fa-arrow-down"></i>
                    </button>
                </form>
                <button type="button" className="btn btn-danger ms-auto" onClick={() => setMostrarModal(true)}> Cerrar Sesion </button>
            </div>

            <div id='menuPerfil' >
                <nav className="navbar navbar-expand-lg pb-0">
                    <div className="container-fluid justify-content-end">

                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarText">
                            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 ">
                                <li
                                    className={`nav-link ${menuPerfilActivo === 1 ? "menuPerfilActivo" : ""}`}
                                    onClick={() => { setMenuPerfilActivo(1) }}
                                >
                                    <a className="nav-link" >Mis canciones</a>
                                </li>
                                <li
                                    className={`nav-link ${menuPerfilActivo === 2 ? "menuPerfilActivo" : ""}`}
                                    onClick={() => { setMenuPerfilActivo(2) }}
                                >
                                    <a className="nav-link" >Lista de deseos</a>
                                </li>
                                <li
                                    className={`nav-link ${menuPerfilActivo === 3 ? "menuPerfilActivo" : ""}`}
                                    onClick={() => { setMenuPerfilActivo(3) }}
                                >
                                    <a className="nav-link" >Lista de favoritos</a>
                                </li>
                                {
                                    esArtista &&
                                    <li
                                        className={`nav-link ${menuPerfilActivo === 4 ? "menuPerfilActivo" : ""}`}
                                        onClick={() => { setMenuPerfilActivo(4) }}
                                    >
                                        <a className="nav-link" >Crear canciones</a>
                                    </li>
                                }
                            </ul>
                        </div>

                    </div>
                </nav>
                {
                    loading ?
                        <Carga />
                        :
                        <div id={`${menuPerfilActivo === 4 ? "crearElem" : "listaElemen"}`}>
                            {menuPerfilActivo === 1 && <Lista elementosDatos={elementosTiene} titulo='Tiene' descarga={true} />}
                            {menuPerfilActivo === 2 && <Lista elementosDatos={elementosDeseo} titulo='Deseos' />}
                            {menuPerfilActivo === 3 && <Lista elementosDatos={artFav} titulo='Favortitos' />}
                            {menuPerfilActivo === 4 && <ManejadorElem />}
                        </div>
                }
            </div>
            {mostrarModal && (
                <div className="modal">
                    <div className="modal-contenido">
                        <p>¿Está seguro de que quiere cerrar sesión?</p>
                        <div className="modal-botones">
                            <button className="button2" onClick={logout}>Sí, cerrar sesión</button>
                            <button className="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}

export default Perfil
