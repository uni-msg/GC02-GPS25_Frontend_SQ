import React, { useState, useEffect } from 'react';
import './InicioSesion.css';
import { auth } from './firebaseConfig.js';
import './firebaseConfig.js';
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UsuarioContext } from './UsuarioContext.js';
import {
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { login, postUsuario, getUsuarioByCorreo } from "./../../ApiServices/UsuarioService.js"

const InicioSesion = () => {
    const [userData, setUserData] = useState({});
    const [artData, setArtData] = useState({});
    const [aceptaPolitica, setAceptaPolitica] = useState(false);
    const [error, setError] = useState('');
    const {
        idLoggedIn, setIdLoggedIn,
        isLoggedIn, setIsLoggedIn,
        nombreUsuario, setNombreUsuario,
        email, setEmail,
        password, setPassword,
        activoArtista, setActivoArtista,
        token, setToken,

        //datos de los usaurios
        contrasenia, setContrasenia,
        nombreReal, setNombreReal,
        correo, setCorreo,
        descripcion, setDescripcion,
        esArtista, setEsArtista,
        fechaRegistro, setFechaRegistro,
        fotoAmazon, setFotoAmazon,

        //datos de los artistas
        esNovedad, setEsNovedad,
        oyentes, setOyentes,
        valoracion, setValoracion,
        idGenero, setIdGenero,
      } = useContext(UsuarioContext);      
    const [chose, setChose] = useState(1);  // Estado para cambiar entre las opciones
    const [captchaValue, setCaptchaValue] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { //al actualizar los user data se actualiza el contexto
        if (userData) {
          setIdLoggedIn(userData.id);
          setContrasenia(userData.contrasenia);
          setNombreUsuario(userData.nombreusuario);
          setNombreReal(userData.nombrereal);
          setCorreo(userData.correo);
          setDescripcion(userData.descripcion);
          setEsArtista(userData.esartista);
          setFechaRegistro(userData.fecharegistro);
          setFotoAmazon(userData.fotoamazon);
        }
        if(userData.esartista){
            setEsNovedad(userData.esnovedad);
            setOyentes(userData.oyentes);
            setValoracion(userData.valoracion);
            setIdGenero(userData.idgenero);
        }
    }, [userData]);

    useEffect(() => { //al actualizar los user data se actualiza el contexto
        setEsNovedad(artData.esNovedad);
        setOyentes(artData.oyentes);
        setValoracion(artData.valoracion);
        setIdGenero(artData.idGenero);
    }, [artData]);
      
    // Inicializar provveedor de autenticación de Firebase
    const googleProvider = new GoogleAuthProvider();
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
    
            const idToken = await user.getIdToken();
            //console.log('ID Token (para backend o Postman):', idToken);
            setToken(idToken);  // Este token se usara para el back
            if (!idToken) {
                alert("No se pudo obtener el token de autenticación.");
                return;
            }

            //Saber si es un nuevo usuario
            const isNewUser = result._tokenResponse?.isNewUser;
    
            if (aceptaPolitica && captchaValue != null) {
               //Si es nuevo se crea el usuario 
               if(isNewUser) {
                    const userData = {
                        nombrereal: user.displayName || "Sin nombre",
                        nombreusuario: user.displayName?.split(" ")[0].toLowerCase() || "usuario",
                        correo: user.email,
                        contrasenia: "google", 
                        esartista: esArtista === null || esArtista ===undefined ? false : esArtista,
                        idgenero: 1
                    };
                    await postUsuario(idToken, userData);
               }
               //await new Promise(res => setTimeout(res, 300)); // 300ms
               const usuarioTmp = await login(idToken);
               //console.log("Usuario desde backend:", usuarioTmp);
               setUserData(usuarioTmp)
               setIsLoggedIn(true);
               setIdLoggedIn(user.uid); 
                
            } else {
                alert("Debes aceptar la política de privacidad y completar el CAPTCHA");
            }
    
        } catch (error) {
            console.error("Error con Google:", error.message);
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData?.email;
    
            console.log('Código de error:', errorCode);
            console.log('Mensaje de error:', errorMessage);
            console.log('Email:', email);
    
            setError("Hubo un problema con el inicio de sesión. Intenta nuevamente.");
        }
    };

    //CREAR CUENTA CON EMAIL
    const registerWithEmail = async (e) => {
        if (aceptaPolitica && (captchaValue != null)) {
            e.preventDefault();
            try {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                const user = result.user;
                //espera a que se devuelva el token;
                
                const userData = {
                    nombrereal: nombreReal,
                    nombreusuario: nombreUsuario,
                    correo: email,
                    contrasenia: password,
                    esartista: esArtista === null || esArtista ===undefined ? false : esArtista,
                    idgenero: 1
                }

                const idToken = await user.getIdToken();
                await postUsuario(idToken, userData);
                const usuarioTmp = await login(idToken);
                setUserData(usuarioTmp);
                setIsLoggedIn(true);
                
            } catch (error) {
                console.error("Error al registrar:", error.message);
                setError(error.message);
            }
        }
        else {
            alert("Debes aceptar la política de privacidad y completar el CAPTCHA");
        }

    };
    //INICIO DE SESIÓN CON EMAIL
    const loginWithEmail = async (e) => {
        if (aceptaPolitica && (captchaValue != null)) {
            setIdLoggedIn(true);
            e.preventDefault();
            try {
                const result = await signInWithEmailAndPassword(auth, email, password);
                const user = result.user;
                const idToken = await user.getIdToken();
              
                const usuarioTmp = await login(idToken);
                setUserData(usuarioTmp)
                setIsLoggedIn(true);
                //console.log("DATOS: ", {nombreReal});
            } catch (error) {
                console.error("Error en inicio de sesión:", error.message);
                setError(error.message);
            }
        }
        else {
            alert("Debes aceptar la política de privacidad y completar el CAPTCHA");
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/perfil"); // Redirige al home si ya está logueado
        }
    }, [isLoggedIn, navigate]);

    /*
     const logout = async () => {
        try {
            await signOut(auth);
            console.log("Sesión cerrada");
            setIdLoggedIn(null); 
            setIdLoggedIn(false);   
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
            setError(error.message);
        }
    };
    */
    const manejarToggle = () => {
        //cambia si es artista o no
        setActivoArtista(!activoArtista);
        //una vez cambiado se refleja en la variable esArtista
        setEsArtista(!activoArtista);
    };

    const handlePolitica = (e) => {
        e.preventDefault();
        if (!aceptaPolitica) {
            setError('Debes aceptar la política de privacidad');
            return;
        }

        // Continuar con el envío del formulario
        setError('');
        //console.log('Formulario enviado');
    };

    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!captchaValue) {
            alert("Por favor completa el CAPTCHA");
            return;
        }
        // Aquí haces el envío del formulario o la autenticación
        //console.log("Formulario enviado con CAPTCHA:", captchaValue);
    };

    // Cambiar la opción seleccionada
    const changeOption = (option) => {
        setChose(option);  // Cambiar la opción seleccionada
    };

    return (
        <div id="login-container">
            {isLoggedIn ? (
                <div>
                    <h2>Bienvenido</h2>
                </div>
            ) : (
                <div id="inicioSesion">
                    <div className="tab-container">
                        <ul className="options">
                            <li
                                id="option1"
                                className={`option ${chose === 1 ? 'option-active' : ''}`}
                                onClick={() => changeOption(1)}
                            >
                                Crear cuenta
                            </li>
                            <li
                                id="option2"
                                className={`option ${chose === 2 ? 'option-active' : ''}`}
                                onClick={() => changeOption(2)}
                            >
                                Inicio de sesión
                            </li>
                        </ul>
                        {/* CREAR CUENTA => CREAR USUARIO O ARTISTA*/}
                        <div className="contents">
                            <div id="content1" className={`content ${chose === 1 ? 'content-active' : ''}`}>
                                <h2>Crear cuenta</h2>
                                <form onSubmit={registerWithEmail}>
                                    <input
                                        type="text"
                                        placeholder="Usuario"
                                        value={nombreUsuario|| ''}
                                        onChange={(e) => setNombreUsuario(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        value={nombreReal|| ''}
                                        onChange={(e) => setNombreReal(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Correo"
                                        value={email|| ''}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Contraseña"
                                        value={password|| ''}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="modoArtista">
                                        <p>Modo artista: </p>
                                        <label className="switch">
                                            <input type="checkbox" onChange={manejarToggle} checked={activoArtista} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <ReCAPTCHA
                                        sitekey="6Lcr3_wqAAAAAIPpuYG5vzuhCCTbbCAXihK-EdAk"
                                        onChange={handleCaptchaChange}
                                        className="captcha-small"
                                    />
                                    <div className="checkbox-politica">
                                        <input
                                            type="checkbox"
                                            id="politica"
                                            checked={aceptaPolitica}
                                            onChange={(e) => setAceptaPolitica(e.target.checked)}
                                        />
                                        <label htmlFor="politica">
                                            Acepto la <a href="https://adaxiang.github.io/politica-privacidad/" target="_blank">Política de Privacidad.</a>
                                        </label>
                                    </div>
                                    <button className="button1" type="submit">Crear cuenta
                                    </button>
                                    <hr className="hr" />
                                    <button onClick={loginWithGoogle } className="button2">
                                        <i className="fa-brands fa-google"></i> Registro con Google
                                    </button>
                                </form>
                            </div>

                            {/* INICO DE SESION  */}
                            <div id="content2" className={`content ${chose === 2 ? 'content-active' : ''}`}>
                                <h2>Inicio sesión</h2>
                                <form onSubmit={loginWithEmail}>
                                    <input
                                        type="email"
                                        placeholder="Correo"
                                        value={email|| ''}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Contraseña"
                                        value={password|| ''}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <ReCAPTCHA
                                        sitekey="6Lcr3_wqAAAAAIPpuYG5vzuhCCTbbCAXihK-EdAk"
                                        onChange={handleCaptchaChange}
                                        className="captcha-small"
                                    />
                                    <div className="checkbox-politica">
                                        <input
                                            type="checkbox"
                                            id="politica"
                                            checked={aceptaPolitica}
                                            onChange={(e) => setAceptaPolitica(e.target.checked)}
                                        />
                                        <label htmlFor="politica">
                                            Acepto la <a href="https://github.com/AdaXiang/politica-privacidad.git" target="_blank">Política de Privacidad.</a>
                                        </label>
                                    </div>
                                    <button className="button1" type="submit">Ingresar</button>
                                    <hr className="hr" />
                                    <button onClick={loginWithGoogle} className="button2">
                                        <i className="fa-brands fa-google"></i> Inicio con Google
                                    </button>
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
