import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// IMPORTANTE: Añadir getComunidadesUsuario
import { getComunidades, getComunidadesUsuario } from '../../ApiServices/ComunidadService';
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga';
import { UsuarioContext } from '../InicioSesion/UsuarioContext';
import './Comunidad.css';
import ComunidadDefecto from '../../Recursos/comunidadDefecto.png';

const Comunidad = () => {
  const [comunidades, setComunidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Estado inicial false para evitar parpadeos
  const [error, setError] = useState(null);

  // Filtro para ver "Todas las Comunidades" o "Mis Comunidades"
  const [filtroActivo, setFiltroActivo] = useState('todas');

  const navigate = useNavigate();

  // Contexto de usuario para saber si está logueado y su ID
  const { isLoggedIn, idLoggedIn } = useContext(UsuarioContext);

  // --- Lógica principal de carga en un único useEffect ---
  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data;
        // Decidimos qué cargar según el filtro y si hay login
        if (filtroActivo === 'mis' && isLoggedIn && idLoggedIn) {
          console.log("Cargando mis comunidades...");
          data = await getComunidadesUsuario(idLoggedIn);
        } else {
          // Por defecto, o si el usuario no está logueado, cargamos todas
          if (filtroActivo === 'mis' && !isLoggedIn) {
             console.warn("Usuario no logueado intenta ver 'Mis Comunidades'. Cargando todas por defecto.");
             setFiltroActivo('todas'); // Reseteamos la pestaña visualmente
          }
          console.log("Cargando todas las comunidades...");
          data = await getComunidades();
        }
        setComunidades(data);
      } catch (err) {
        console.error("Error al cargar comunidades:", err);
        setError(err.message || "Error al cargar los datos");
        // Lista vacía en caso de error para que no se quede pillado
        setComunidades([]); 
      } finally {
        setIsLoading(false);
      }
    };

    // Ejecutamos la carga si el filtro o el estado de login cambian
    cargarDatos();
  }, [filtroActivo, isLoggedIn, idLoggedIn]);


  const verDetalleComunidad = (comunidad) => {
    navigate('/masInfoComunidad', { state: comunidad });
  };

  if (error) return <div className="comunidad-container error">Error: {error}</div>;

  return (
    <div className="comunidad-container">
      <h1 className="titulo-principal">Comunidades UnderSounds</h1>
      
      {/* --- PESTAÑAS DE FILTRO (TODAS O MIS COMUNIDADES) --- */}
      <div className="tabs-filtro-comunidad">
        <button 
          className={`tab-filtro-btn ${filtroActivo === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltroActivo('todas')}
        >
          Todas las Comunidades
        </button>
        
        {/* El botón de "Mis Comunidades" solo se muestra si el usuario está logueado */}
        {isLoggedIn && (
          <button 
            className={`tab-filtro-btn ${filtroActivo === 'mis' ? 'active' : ''}`}
            onClick={() => setFiltroActivo('mis')}
          >
            Mis Comunidades
          </button>
        )}
      </div>
      {/* --- FIN PESTAÑAS --- */}

      {isLoading ? (
        <PantallaCarga />
      ) : comunidades.length === 0 ? (
        <p className="text-muted text-center mt-4">No se encontraron comunidades.</p>
      ) : (
        <div className="comunidad-grid">
          {comunidades.map((comunidad) => (
            <div 
              key={comunidad.idComunidad} 
              className="comunidad-card"
              onClick={() => verDetalleComunidad(comunidad)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={comunidad.rutaImagen || ComunidadDefecto} 
                alt={comunidad.nombreComunidad} 
                className="comunidad-imagen" 
              />
              <div className="comunidad-info">
                <span className="artista-badge">
                  🎵 {comunidad.artista?.nombreUsuario || 'Artista Desconocido'}
                </span>
                <h3>{comunidad.nombreComunidad}</h3>
                <p className="descripcion">
                  {comunidad.descComunidad || 'Sin descripción disponible.'}
                </p>
              </div>
              <div className="comunidad-stats">
                <div className="stat-item">
                  <span>{comunidad.numPublicaciones}</span> Publicaciones
                </div>
                <div className="stat-item">
                  <span>{comunidad.numUsuarios}</span> Miembros
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comunidad;