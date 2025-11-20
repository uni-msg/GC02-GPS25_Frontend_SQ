// Soporte.js
import React, { useState, useEffect } from 'react';
import './Soporte.css';
import apoyo from '../../Recursos/apoyo-tecnico.png';

function Soporte() {
    const [preguntaActiva, setPreguntaActiva] = useState(null);
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);

    const handleReset = () => {
        setNombre('');
        setCorreo('');
        setAsunto('');
        setMensaje('');
        setMostrarModal(false); // cerrar el modal después de vaciar
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const preguntas = [
        {
            titulo: '¿Cómo compro una canción o álbum?',
            respuesta: 'Para comprar contenido, solo haz clic en el botón "Comprar" junto a la canción o álbum y sigue las instrucciones de pago.'
        },
        {
            titulo: '¿Dónde encuentro mi música comprada?',
            respuesta: 'Ve a tu perfil y entra en la sección "Mis canciones". Ahí verás todas tus canciones y álbumes adquiridos.'
        },
        {
            titulo: '¿Puedo descargar las canciones a mi dispositivo?',
            respuesta: 'No. Sólo se pueden reproducir desde la página web.'
        },
        {
            titulo: '¿Qué métodos de pago aceptan?',
            respuesta: 'Aceptamos tarjetas de crédito, débito, PayPal y pagos a través de Apple Pay o Google Pay.'
        },
        {
            titulo: '¿Puedo obtener un reembolso?',
            respuesta: 'Los reembolsos están disponibles solo en casos justificados, como errores técnicos. Por favor, contáctanos dentro de los 7 días.'
        }
    ];

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const el = document.querySelector(hash);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, []);

    const togglePregunta = (index) => {
        setPreguntaActiva(preguntaActiva === index ? null : index);
    };

    return (
        <div id="soporte-container">
            <h1 className='texto-subrayado'>Soporte</h1>

            <section id="faq" className="seccion">
                <h2>FAQ</h2>
                <div className="faq-list">
                    {preguntas.map((item, index) => (
                        <div key={index} className={`faq-item ${preguntaActiva === index ? 'show' : ''}`}>
                            <div className="item-question" onClick={() => togglePregunta(index)}>
                                <span>{item.titulo}</span>
                                <span className="arrows">
                                    {preguntaActiva === index ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i>}
                                </span>
                            </div>
                            {preguntaActiva === index && (
                                <div className="item-answer">
                                    <p>{item.respuesta}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section id="contacto" className="seccion">
                <h2>Contáctanos</h2>
                <div className="formulario-container">
                    <div>
                        <form className="formulario-soporte" onSubmit={handleSubmit}>
                            <div id="nombreCont">
                                <label htmlFor="nombre">Nombre usuario</label>
                                <input
                                    className="campo"
                                    placeholder="Javier"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>

                            <div id="correoCont">
                                <label htmlFor="correo">Correo</label>
                                <input
                                    className="campo"
                                    placeholder="xxx@gmail.com"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    required
                                />
                            </div>

                            <div id="asuntoCont">
                                <label htmlFor="asunto">Asunto</label>
                                <input
                                    className="campo"
                                    placeholder="Consulta, duda, etc."
                                    value={asunto}
                                    onChange={(e) => setAsunto(e.target.value)}
                                    required
                                />
                            </div>

                            <textarea
                                className="mensaje"
                                placeholder="Escribe tu mensaje..."
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                required
                            />

                            <div className="button-container">
                                <button
                                    type="button"
                                    className="button2"
                                    onClick={() => setMostrarModal(true)}
                                >
                                    Vaciar
                                </button>
                                <button type="submit" className="button">
                                    Enviar
                                </button>
                            </div>
                        </form>
                    </div>
                    <div>
                        <img src={apoyo} alt="contacto" className="imagen" />
                    </div>
                </div>
            </section>

            <section id="otrosContactos" className="seccion">
                <h2>Otros contactos</h2>
                <div className="otrosContactos">
                    <div>
                        <a href="https://x.com/home?lang=es" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-square-x-twitter fa-5x"></i>
                        </a>
                    </div>
                    <div>
                        <a href="https://discord.com/" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-discord fa-5x"></i>
                        </a>
                    </div>
                    <div>
                        <a href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-linkedin fa-5x"></i>
                        </a>
                    </div>
                    <div>
                        <a href="https://www.tiktok.com/@tiktok_es?lang=es" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-tiktok fa-5x"></i>
                        </a>
                    </div>
                </div>
            </section>

            {mostrarModal && (
                <div className="modal">
                    <div className="modal-contenido">
                        <p>¿Está seguro de que quiere vaciar el formulario?</p>
                        <div className="modal-botones">
                            <button className="button2" onClick={handleReset}>Sí, vaciar</button>
                            <button className="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Soporte;
