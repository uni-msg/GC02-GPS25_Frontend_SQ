import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos la función del servicio que acabamos de crear
import { getComunidades } from '../../ApiServices/ComunidadService'; 
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga';
import ComunidadDefecto from '../../Recursos/comunidadDefecto.png'; // Imagen por defecto para comunidades
import './Comunidad.css';

const Comunidad = () => {
  const [comunidades, setComunidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComunidades = async () => {
      try {
        // Llamada limpia al servicio
        const data = await getComunidades();
        setComunidades(data);
      } catch (err) {
        console.error("Fallo al cargar comunidades:", err);
        // Usamos el mensaje de error procesado por el servicio
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComunidades();
  }, []);

  const verDetalleComunidad = (comunidad) => {
    navigate('/masInfoComunidad', { state: comunidad });
  };

  if (isLoading) return <PantallaCarga />;
  if (error) return <div className="comunidad-container error">Error: {error}</div>;

  return (
    <div className="comunidad-container">
      <h1 className="titulo-principal">Comunidades UnderSounds</h1>
      
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
    </div>
  );
};

export default Comunidad;