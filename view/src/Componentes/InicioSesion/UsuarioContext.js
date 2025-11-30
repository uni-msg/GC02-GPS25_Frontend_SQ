import React, { createContext, useState } from "react";
export const UsuarioContext = createContext(); // Crear el contexto

// DATOS UTILES EN LA WEB
export const UsuarioProvider = ({ children }) => {
  const [idLoggedIn, setIdLoggedIn] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activoArtista, setActivoArtista] = useState(false);
  const [token, setToken] = useState(null);

  const [contrasenia, setContrasenia] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState(null);
  const [nombreReal, setNombreReal] = useState('');
  const [correo, setCorreo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esArtista, setEsArtista] = useState(false);
  const [fechaRegistro, setFechaRegistro] = useState('');
  const [fotoAmazon, setFotoAmazon] = useState(null);
  
  const [esNovedad, setEsNovedad] = useState(false);
  const [oyentes, setOyentes] = useState(0);
  const [valoracion, setValoracion] = useState(0);
  const [idGenero, setIdGenero] = useState(null);
  const [nombreGenero, setNombreGenero] = useState('');

    // 🔹 FUNCION LOGOUT PARA RESETEAR TODOS LOS DATOS
  const logoutData = () => {
    setIdLoggedIn(null);
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setActivoArtista(false);
    setToken(null);

    setContrasenia(null);
    setNombreUsuario(null);
    setNombreReal('');
    setCorreo('');
    setDescripcion('');
    setEsArtista(false);
    setFechaRegistro('');
    setFotoAmazon(null);

    setEsNovedad(false);
    setOyentes(0);
    setValoracion(0);
    setIdGenero(null);
    setNombreGenero('');
  };

  return (
    <UsuarioContext.Provider value={{
      idLoggedIn, setIdLoggedIn,
      isLoggedIn, setIsLoggedIn,
      email, setEmail,
      password, setPassword,
      activoArtista, setActivoArtista,
      token, setToken,

      //datos de los usaurios
      contrasenia, setContrasenia,
      nombreUsuario, setNombreUsuario,
      nombreReal, setNombreReal,
      correo, setCorreo,
      descripcion, setDescripcion,
      esArtista, setEsArtista,
      fechaRegistro, setFechaRegistro,
      fotoAmazon, setFotoAmazon,

      //datos especifico del artista
      esNovedad, setEsNovedad,
      oyentes, setOyentes,
      valoracion, setValoracion,
      idGenero, setIdGenero,
      nombreGenero, setNombreGenero,

      logoutData
    }}>
      {children}
    </UsuarioContext.Provider>
  );
};
