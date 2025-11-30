import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate  } from "react-router-dom";
import { UsuarioProvider, UsuarioContext } from './Componentes/InicioSesion/UsuarioContext.js';

import { getElementos } from  "./ApiServices/ElementosService.js"

import MasInfoPerfil from './Componentes/MasInfoPerfil/MasInfoPerfil.js';
import MasInfo from './Componentes/MasInfo/MasInfoCancion.js';
import MasInfoAlbum from './Componentes/MasInfoAlbum/MasInfoAlbum.js';
import Cesta from './Componentes/Cesta/Cesta.js';
import IncioSesion from './Componentes/InicioSesion/IncioSesion.js';
import Catalogo from './Componentes/Catalogo/Catalogo.js';
import reportWebVitals from './reportWebVitals';
import Perfil from './Componentes/Perfil/Perfil.js';
import Cabecera from './Componentes/Cabecera/Header.js';
import Pie from './Componentes/Pie/Footer.js';
import Soporte from './Componentes/Soporte/Soporte.js';
import Estadisticas from './Componentes/Estadisticas/Estadisticas.js';
import Prueba from './Componentes/prueba.js';
import CrearElem from './Componentes/CrearElem/CrearElem.js';
import Comunidades from './Componentes/Comunidad/Comunidad.js';
import MasInfoComunidades from './Componentes/MasInfoComunidad/MasInfoComunidad.js';

const Layout = () => {
  const [usuario, setUsuario] = useState("a");
  return (
    <>
      <Cabecera />
      <Outlet context={{ usuario, setUsuario }} />
      <Pie />
    </>
  );
};

function AppRoutes() {
  const location = useLocation();
  const [elementos, setElementos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useContext(UsuarioContext);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const elementosData = await getElementos();
      setElementos(elementosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/") {
      fetchData();
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Catalogo elementos={elementos} isLoading={isLoading} />} />
        <Route path="inicio" element={<IncioSesion />} />
        <Route path="soporte" element={<Soporte />} />
        <Route path="masInfo" element={<MasInfo />} />
        <Route path="masInfoAlbum" element={<MasInfoAlbum />} />
        <Route path="masInfoPerfil" element={<MasInfoPerfil />} />
        <Route path="estadisticas" element={<Estadisticas />} />
        <Route path='prueba' element={<Prueba />} />
        <Route path='crearElem' element={<CrearElem />} />
        <Route path='comunidades' element={<Comunidades />} />
        <Route path='masInfoComunidad' element={<MasInfoComunidades />} />
        {/* Rutas protegidas, sin sesion nada */}
        {isLoggedIn ? (
          <>
          
            <Route path="perfil" element={<Perfil idMenu={1} />} />
            <Route path="deseos" element={<Perfil idMenu={2} />} />
            <Route path="cesta" element={<Cesta />} />
          </>
        ) : (
          // Redirige cualquier otra ruta no pública, va al catalogo
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        )}
      </Route>
    </Routes>
  );
}

function Main() {
  return (
    <UsuarioProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UsuarioProvider>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);

reportWebVitals();
