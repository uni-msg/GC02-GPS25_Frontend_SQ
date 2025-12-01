import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos la función de crear
import { getComunidades, getComunidadesUsuario, crearComunidad } from '../../ApiServices/ComunidadService'; 
import PantallaCarga from '../Utiles/PantallaCarga/PantallaCarga';
import { UsuarioContext } from '../InicioSesion/UsuarioContext';
import ComunidadDefecto from '../../Recursos/comunidadDefecto.png';
import './Comunidad.css';

const Comunidad = () => {
  const [comunidades, setComunidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState('todas');

  // --- ESTADOS PARA CREACIÓN ---
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [formCrear, setFormCrear] = useState({ nombre: '', descripcion: '', imagen: '' });

  const navigate = useNavigate();
  
  // Comprobamos si el usuario está logueado
  // Obtenemos 'usuario' para saber si es artista (usuario.esArtista)
  const { isLoggedIn, idLoggedIn, esArtista } = useContext(UsuarioContext);

  // ------------------ BLOQUE DE DIAGNÓSTICO -----------------
  console.group("🔍 DIAGNÓSTICO COMUNIDAD");
  console.log("1. ¿Está logueado (isLoggedIn)?:", isLoggedIn);
  console.log("2. ID logueado:", idLoggedIn);
  // Esta es la clave. Si esto sale 'undefined' o 'false', el botón no saldrá.
  console.log("3. ¿Es artista según el objeto? (usuario?.esArtista):", esArtista); 

  console.groupEnd();
  // ---------------- FIN BLOQUE DE DIAGNÓSTICO ----------------

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data;
        if (filtroActivo === 'mis' && isLoggedIn && idLoggedIn) {
          data = await getComunidadesUsuario(idLoggedIn);
        } else {
          if (filtroActivo === 'mis' && !isLoggedIn) setFiltroActivo('todas');
          data = await getComunidades();
        }
        setComunidades(data);
      } catch (err) {
        console.error("Error al cargar comunidades:", err);
        setError(err.message);
        setComunidades([]); 
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [filtroActivo, isLoggedIn, idLoggedIn]);

  // --- LÓGICA DE CREACIÓN DE COMUNIDADES---

  const handleAbrirCrear = () => {
    // 1. Comprobar si ya tiene comunidad
    // Buscamos en la lista completa si hay alguna donde el idArtista coincida con el logueado
    const yaTieneComunidad = comunidades.some(c => {
        // Normalizamos IDs a string para comparar seguro
        const creadorId = c.artista?.idArtista || c.idArtista;
        return creadorId && creadorId.toString() === idLoggedIn.toString();
    });

    if (yaTieneComunidad) {
        alert("⚠️ Aviso: Ya tienes una comunidad creada.\n\nSolo se permite una comunidad por artista. Si quieres crear otra, deberás eliminar la actual primero.");
        return;
    }

    // 2. Si no tiene, abrimos el modal
    setFormCrear({ nombre: '', descripcion: '', imagen: '' }); // Reset
    setShowModalCrear(true);
  };

  const handleGuardarComunidad = async () => {
    if (!formCrear.nombre.trim()) return alert("El nombre es obligatorio");
    
    try {
        const nuevaComunidadData = {
            nombreComunidad: formCrear.nombre,
            descComunidad: formCrear.descripcion,
            rutaImagen: formCrear.imagen,
            idArtista: idLoggedIn // El backend necesita saber quién la crea
        };

        const nueva = await crearComunidad(nuevaComunidadData);
        
        alert("¡Comunidad creada con éxito!");
        setShowModalCrear(false);
        
        // Añadimos la nueva a la lista y navegamos a ella o recargamos
        setComunidades(prev => [...prev, nueva]);
        // Opcional: Ir directo a ella
        navigate('/masInfoComunidad', { state: nueva });

    } catch (e) {
        console.error(e);
        alert("Error al crear: " + (e.response?.data?.error || e.message));
    }
  };

  const verDetalleComunidad = (comunidad) => {
    navigate('/masInfoComunidad', { state: comunidad });
  };

  if (isLoading) return <PantallaCarga />;
  if (error) return <div className="comunidad-container error">Error: {error}</div>;

  return (
    <div className="comunidad-container">
      <div className="header-comunidades">
          <h1 className="titulo-principal">Comunidades UnderSounds</h1>
          
          {/* BOTÓN CREAR (Solo si es artista y está logueado) */}
          {isLoggedIn && esArtista && (
              <button className="btn-crear-flotante" onClick={handleAbrirCrear}>
                  <i className="bi bi-plus-lg me-2"></i> Crear mi Comunidad
              </button>
          )}
      </div>
      
      {/* PESTAÑAS */}
      <div className="tabs-filtro-comunidad">
        <button 
          className={`tab-filtro-btn ${filtroActivo === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltroActivo('todas')}
        >
          Todas las Comunidades
        </button>
        {isLoggedIn && (
          <button 
            className={`tab-filtro-btn ${filtroActivo === 'mis' ? 'active' : ''}`}
            onClick={() => setFiltroActivo('mis')}
          >
            Mis Comunidades
          </button>
        )}
      </div>

      {/* GRID */}
      {comunidades.length === 0 ? (
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

      {/* --- MODAL CREAR COMUNIDAD --- */}
      {showModalCrear && (
        <div className="info-modal-overlay" onClick={() => setShowModalCrear(false)}>
            <div className="info-modal-content modal-crear" onClick={e => e.stopPropagation()}>
                <div className="modal-header mb-3">
                    <h3 className="text-purple">Nueva Comunidad</h3>
                    <button className="btn-close-modal" onClick={() => setShowModalCrear(false)}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="mb-3">
                        <label className="form-label fw-bold">Nombre *</label>
                        <input type="text" className="form-control" 
                            value={formCrear.nombre}
                            onChange={e => setFormCrear({...formCrear, nombre: e.target.value})}
                            placeholder="Ej: Los Rockeros de Madrid"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Descripción</label>
                        <textarea className="form-control" rows="3"
                            value={formCrear.descripcion}
                            onChange={e => setFormCrear({...formCrear, descripcion: e.target.value})}
                            placeholder="¿De qué va tu comunidad?"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold">Imagen (URL)</label>
                        <input type="text" className="form-control" 
                            value={formCrear.imagen}
                            onChange={e => setFormCrear({...formCrear, imagen: e.target.value})}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary" onClick={() => setShowModalCrear(false)}>Cancelar</button>
                        <button className="btn btn-purple" onClick={handleGuardarComunidad}>Crear Comunidad</button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Comunidad;