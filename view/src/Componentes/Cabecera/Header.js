import './Header.css';
import logo from './../../Recursos/logoUnderSound.png';

import datos from '../../Datos/tutoriales.json';

import { UsuarioContext } from "../InicioSesion/UsuarioContext.js";
import { CLOUD_URL_DEFAULT, URL_FOTO } from '../../config.js';

import { Link } from "react-router-dom";
import React, { useContext, useState } from 'react';

function Header() {
    const { isLoggedIn, fotoAmazon } = useContext(UsuarioContext);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [ayuda, setAyuda] = useState(null);

    const abrirAyuda = () => {
        setAyuda(datos); // ya está importado como JSON
        setMostrarModal(true);
    };

    return (
        <>
            <header id="cabecera" className="d-flex px-4 py-2 bg-primary-subtle">
                <div>
                    <img src={logo} className="" alt="icono de la aplicacion" />
                </div>
                <Link to="/"><h3 className="text-morado fst-italic">UnderSound</h3></Link>

                <i
                    className="fa-regular fa-circle-question ms-1 me-auto"
                    onClick={abrirAyuda}
                ></i>

                {isLoggedIn ? (
                    <>
                        <Link to="/cesta"><i className="fa-solid fa-basket-shopping"></i></Link>
                        <Link to="/deseos"><i className="fa-duotone fa-regular fa-heart"></i></Link>
                        <Link to="/perfil"><img src={fotoAmazon && fotoAmazon !== "null"? `${URL_FOTO}${fotoAmazon}`: `${CLOUD_URL_DEFAULT}` } id="iconoPerfilHeader" alt="icono de la aplicacion" /></Link>
                    </>
                ) : (
                    <Link to="/inicio"><i className="fa-regular fa-circle-user"></i></Link>
                )}

                {mostrarModal && (
                    <div className="modal">
                        <div className="modal-contenido">
                            <div className="d-flex justify-content-between">
                                <span></span>
                                <i className="fa-solid fa-xmark" onClick={() => setMostrarModal(false)}></i>
                            </div>

                            <h2>Tips de uso</h2>
                            {ayuda && ayuda.map((item) => (
                                <div key={item.id}>
                                    <h4>{item.nombreVista}</h4>
                                    <ul>
                                        {item.aclaraciones.map((linea, index) => (
                                            <li key={index}>{linea}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}

export default Header;
