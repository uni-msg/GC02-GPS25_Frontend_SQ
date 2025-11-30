import './InicioSesion.css';
import React, { useState, useEffect,useContext } from 'react';
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { signInWithEmailAndPassword, } from "firebase/auth"; //signInWithPopup, GoogleAuthProvider,

import './firebaseConfig.js';
import { auth } from './firebaseConfig.js';
import { login, postUsuario } from "./../../ApiServices/UsuarioService.js"
import { UsuarioContext } from './UsuarioContext.js';

const InicioSesion = () => {
    const [userData, setUserData] = useState({});
    const [aceptaPolitica, setAceptaPolitica] = useState(false);
    const [error, setError] = useState('');
    const {
        setIdLoggedIn,
        isLoggedIn, setIsLoggedIn,
        nombreUsuario, setNombreUsuario,
        email, setEmail,
        password, setPassword,
        activoArtista, setActivoArtista,
        setToken,

        //datos de los usaurios
        setContrasenia,
        nombreReal, setNombreReal,
        setCorreo,
        setDescripcion,
        esArtista, setEsArtista,
        setFechaRegistro,
        setFotoAmazon,

        //datos de los artistas
        setEsNovedad,
        setOyentes,
        setValoracion,
        idGenero, setIdGenero,
        setNombreGenero,
      } = useContext(UsuarioContext);      
    const [chose, setChose] = useState(1);  // Estado para cambiar entre las opciones
    const [captchaValue, setCaptchaValue] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData || Object.keys(userData).length === 0) return;

        // Datos comunes del usuario
        setIdLoggedIn(userData.id);
        setContrasenia(userData.contrasenia);
        setNombreUsuario(userData.nombreusuario);
        setNombreReal(userData.nombrereal);
        setCorreo(userData.correo);
        setDescripcion(userData.descripcion);
        setEsArtista(userData.esartista);
        setFechaRegistro(userData.fecharegistro);
        setFotoAmazon(userData.rutafoto);

        // Si es artista, cargar datos adicionales
        if (userData.esartista) {
            setEsNovedad(userData.esnovedad);
            setOyentes(userData.oyentes);
            setValoracion(userData.valoracion);

            // género ahora viene como objeto { id, nombre }
            if (userData.genero) {
                setIdGenero(userData.genero.id);
                setNombreGenero(userData.genero.nombre);
            }
        }
    }, [userData]);
      
    // Inicializar proveedor de Google
    //const googleProvider = new GoogleAuthProvider();

    /* ============================================================
    HELPERS
    ============================================================ */

    // Login en Firebase con correo y contraseña fija (para Google)
    /*
    const firebaseLoginFixed = async (email) => {
        const result = await signInWithEmailAndPassword(auth, email, "123123123");
        const user = result.user;
        return await user.getIdToken();
    };*/

    // Login genérico en tu backend
    const loginBackendWithToken = async (idToken) => {
        const usuarioTmp = await login(idToken);
        setToken(idToken);
        setUserData(usuarioTmp);
        setIsLoggedIn(true);
    };

    // Validación de política y captcha
 /*    const validarPoliticaYCaptcha = () => {
        if (!aceptaPolitica || !captchaValue) {
            alert("Debes aceptar la política de privacidad y completar el CAPTCHA");
            return false;
        }
        return true;
    };*/


    /* ============================================================
    REGISTRO CON GOOGLE
    ============================================================ */
/* 
    const registerWithGoogle = async () => {
        try {
            if (!validarPoliticaYCaptcha()) return;
            const { user } = await signInWithPopup(auth, googleProvider);

            const fechaStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
            const nombreAuto = `${(user.displayName?.split(" ")[0] || "usuario").toLowerCase()}_${fechaStr}`;
            const userData = {
                nombreusuario: nombreAuto,
                nombrereal: user.displayName,
                contrasenia: "123123123",
                correo: user.email,
                esartista: !!esArtista,
                ...(esArtista && {
                    esnovedad: true,
                    oyentes: 0,
                    valoracion: 0,
                    genero: { id: 1 }
                })
            };

            await postUsuario(userData);
            const idToken = await firebaseLoginFixed(user.email);
            await loginBackendWithToken(idToken);
        } catch (error) {
            console.error("Error con Google:", error);
            setError("Hubo un problema con el registro mediante Google.");
        }
    };
*/

    /* ============================================================
    INICIAR SESIÓN CON GOOGLE
    ============================================================ */
/* 
    const loginWithGoogle = async () => {
        try {
            if (!validarPoliticaYCaptcha()) return;
            const { user } = await signInWithPopup(auth, googleProvider);

            const idToken = await firebaseLoginFixed(user.email);
            await loginBackendWithToken(idToken);

        } catch (error) {
            console.error("Error con Google:", error);
            setError("No se pudo iniciar sesión con Google.");
        }
    };
*/

    /* ============================================================
    REGISTRO CON EMAIL
    ============================================================ */

    const registerWithEmail = async (e) => {
        e.preventDefault();
        if (aceptaPolitica || captchaValue) {
            try {
                const userData = {
                    nombreusuario: nombreUsuario,
                    nombrereal: nombreReal,
                    contrasenia: password,
                    correo: email,
                    esartista: !!esArtista,
                    ...(esArtista && {
                        esnovedad: true,
                        oyentes: 0,
                        valoracion: 0,
                        genero: { id: 1 }
                    })
                };
                await postUsuario(userData);

                const result = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await result.user.getIdToken();
                await loginBackendWithToken(idToken);

            } catch (error) {
                console.error("Error al registrar:", error.message);
                setError(error.message);
            }
        }else{
            alert("Debes aceptar la política de privacidad y completar el CAPTCHA");
        }
    };


    /* ============================================================
    INICIO SESIÓN EMAIL
    ============================================================ */

    const loginWithEmail = async (e) => {
        e.preventDefault();
        if (aceptaPolitica || captchaValue) {
            try {
                const result = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await result.user.getIdToken();

                await loginBackendWithToken(idToken);

            } catch (error) {
                console.error("Error en inicio de sesión:", error);
                setError(error.message);
            }
        }else{
            alert("Debes aceptar la política de privacidad y completar el CAPTCHA");
        }
    };


    // Redirige al home si ya está logueado
    useEffect(() => {
        if (isLoggedIn) {
            navigate("/perfil"); 
        }
    }, [isLoggedIn, navigate]);

    const manejarToggle = () => {
        setActivoArtista(!activoArtista);//cambia si es artista o no
        setEsArtista(!activoArtista);//una vez cambiado se refleja en la variable esArtista
    };

    // Indica si eres humano
    const handleCaptchaChange = (value) => { setCaptchaValue(value); };

    // Cambiar la opción (INICIAR O REGISTRARSE)
    const changeOption = (option) => { setChose(option);};

    return (
        <div id="login-container">
            {isLoggedIn ? (
                <div>
                    <h2>Bienvenido</h2>
                </div>
            ) : (
                <div id="inicioSesion">
                    <div className="tab-container">

                        {/* Menu de registro o inicio sesion*/}
                        <ul className="options">
                            <li id="option1" className={`option ${chose === 1 ? 'option-active' : ''}`} onClick={() => changeOption(1)} > Crear cuenta </li>
                            <li id="option2" className={`option ${chose === 2 ? 'option-active' : ''}`} onClick={() => changeOption(2)} > Inicio de sesión </li>
                        </ul>

                        {/* CREAR CUENTA => CREAR USUARIO O ARTISTA*/}
                        <div className="contents">
                            <div id="content1" className={`content ${chose === 1 ? 'content-active' : ''}`}>
                                <h2>Crear cuenta</h2>
                                <form onSubmit={registerWithEmail}>
                                    <input type="text" placeholder="Usuario" value={nombreUsuario|| ''} onChange={(e) => setNombreUsuario(e.target.value)} required />
                                    <input type="text" placeholder="Nombre" value={nombreReal|| ''} onChange={(e) => setNombreReal(e.target.value)} required />
                                    <input type="email" placeholder="Correo" value={email|| ''} onChange={(e) => setEmail(e.target.value)} required />
                                    <input type="password" placeholder="Contraseña" value={password|| ''} onChange={(e) => setPassword(e.target.value)} required />
                                    
                                    {/* UNICO PARA ARTISTA */}
                                    <div className="modoArtista">
                                        <p>Modo artista: </p>
                                        <label className="switch">
                                            <input type="checkbox" onChange={manejarToggle} checked={activoArtista} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    <ReCAPTCHA sitekey="6Lcr3_wqAAAAAIPpuYG5vzuhCCTbbCAXihK-EdAk" onChange={handleCaptchaChange} className="captcha-small" />
                                    <div className="checkbox-politica">
                                        <input type="checkbox" id="politica" checked={aceptaPolitica} onChange={(e) => setAceptaPolitica(e.target.checked)} />
                                        <label htmlFor="politica"> Acepto la <a href="https://adaxiang.github.io/politica-privacidad/" target="_blank" rel="noopener noreferrer">Política de Privacidad.</a> </label>
                                    </div>
                                    
                                    <button className="button1" type="submit"> Crear cuenta </button>
                                    <hr className="hr" />
                                    {/* <button onClick={registerWithGoogle} className="button2"> <i className="fa-brands fa-google"></i> Registro con Google </button>  */}
                                </form>
                            </div>

                            {/* INICO DE SESION  */}
                            <div id="content2" className={`content ${chose === 2 ? 'content-active' : ''}`}>
                                <h2>Inicio sesión</h2>
                                <form onSubmit={loginWithEmail}>
                                    <input type="email" placeholder="Correo" value={email|| ''} onChange={(e) => setEmail(e.target.value)} required />
                                    <input type="password" placeholder="Contraseña" value={password|| ''} onChange={(e) => setPassword(e.target.value)} required />

                                    <ReCAPTCHA sitekey="6Lcr3_wqAAAAAIPpuYG5vzuhCCTbbCAXihK-EdAk" onChange={handleCaptchaChange} className="captcha-small" />
                                    <div className="checkbox-politica">
                                        <input type="checkbox" id="politica" checked={aceptaPolitica} onChange={(e) => setAceptaPolitica(e.target.checked)} />
                                        <label htmlFor="politica"> Acepto la <a href="https://github.com/AdaXiang/politica-privacidad.git" target="_blank" rel="noopener noreferrer">Política de Privacidad.</a> </label>
                                    </div>

                                    <button className="button1" type="submit">Ingresar</button>
                                    <hr className="hr" />
                                    {/* <button onClick={loginWithGoogle} className="button2"> <i className="fa-brands fa-google"></i> Inicio con Google </button>  */}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InicioSesion;
