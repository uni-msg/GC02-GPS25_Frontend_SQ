import axios from 'axios';
import { BASE_URL_COMUNIDADES } from '../config'; // llamada a la api

// --- COMUNIDADES ---

// Obtiene todas las comunidades
export async function getComunidades() {
    // GET /comunidad/
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener las comunidades');
    }
};

// Obtener detalles de una comunidad por su ID
export async function getComunidadById(idComunidad) {
    // GET /comunidad/{idComunidad}/
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/${idComunidad}/`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener los detalles de la comunidad');
    }
};

// Permite a los artistas que hayan iniciado sesión crear una nueva comunidad.
export async function crearComunidad(datosJson) {
    // POST /comunidad/
    const response = await axios.post(`${BASE_URL_COMUNIDADES}/`, datosJson);
    return response.data;
};

// Obtener comunidades a las que pertenece el usuario que haya iniciado sesión.
export async function getComunidadesUsuario(idUsuario) {
    // GET /comunidad/mis-comunidades/{idUsuario}/
    const response = await axios.get(`${BASE_URL_COMUNIDADES}/mis-comunidades/${idUsuario}/`);
    return response.data;
};

// --- GESTIÓN DE LA COMUNIDAD (Artista Admin) ---

// Permite al artista creador actualizar los datos de su comunidad.
export const actualizarComunidad = async (idComunidad, datosJson) => {
    // PUT /comunidad/{idComunidad}/
    const response = await axios.put(`${BASE_URL_COMUNIDADES}/${idComunidad}/`, datosJson);
    return response.data;
};  

// Permite al artista creador eliminar su comunidad.
export const eliminarComunidad = async (idComunidad) => {
    // DELETE /comunidad/{idComunidad}/
    await axios.delete(`${BASE_URL_COMUNIDADES}/${idComunidad}/`);
    return true;
};

// --- PUBLICACIONES ---

// Devuelve las publicaciones de una comunidad específica
export async function getPublicacionesComunidad(idComunidad) {
    // GET /comunidad/publicaciones/{idComunidad}/
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/publicaciones/${idComunidad}/`);
        return response.data;
    } catch (error) {
        // Si devuelve 404 es que no hay publicaciones, no es un error grave.
        if (error.response && error.response.status === 404) {
            return [];
        }
        throw new Error(error.response?.data?.message || 'Error al obtener las publicaciones');
    }
};

// --- GESTIÓN DE PUBLICACIONES (Artista Admin) ---

// Permite al artista creador de la comunidad crear una nueva publicación.
export const crearPublicacion = async (idComunidad, datosJson) => {
    // POST /comunidad/publicaciones/{idComunidad}/ 
    const response = await axios.post(`${BASE_URL_COMUNIDADES}/publicaciones/${idComunidad}/`, datosJson);
    return response.data;
};

// Permite al artista creador de la comunidad eliminar una publicación.
export const eliminarPublicacion = async (idComunidad, idPublicacion) => {
    // DELETE /comunidad/publicaciones/{idComunidad}/{idPublicacion}/
    await axios.delete(`${BASE_URL_COMUNIDADES}/publicaciones/${idComunidad}/${idPublicacion}/`);
    return true;
};

// Permite al artista creador de la comunidad editar una publicación.
export const editarPublicacion = async (idComunidad, idPublicacion, datosJson) => {
    // PUT /comunidad/publicaciones/{idComunidad}/{idPublicacion}/
    const response = await axios.patch(`${BASE_URL_COMUNIDADES}/publicaciones/${idComunidad}/${idPublicacion}/`, datosJson);
    return response.data;
};

// --- LIKES EN PUBLICACIONES ---

// Obtener los likes de una publicación específica.
export async function getLikesPublicacion(idPublicacion) {
    // GET /comunidad/publicaciones/megusta/{idPublicacion}/
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/publicaciones/megusta/${idPublicacion}/`);
        return response.data;
    } catch (error) {
        throw new Error('Error al verificar likes');
    }
};

// Dar like a una publicación específica.
export async function darLikePublicacion(idPublicacion, idUsuario) {
    // POST /comunidad/publicaciones/megusta/{idPublicacion}/
    try {
        const response = await axios.post(`${BASE_URL_COMUNIDADES}/publicaciones/megusta/${idPublicacion}/`, {
            data: { idUsuario: idUsuario }    // body de la petición POST, pasamos el id del usuario que da el like
        });
        return response.data; // Devuelve el nuevo contador
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al dar like');
    }
};

// Quitar like a una publicación específica.
export async function quitarLikePublicacion(idPublicacion, idUsuario) {
    // DELETE /comunidad/publicaciones/megusta/{idPublicacion}/
    try {
        const response = await axios.delete(`${BASE_URL_COMUNIDADES}/publicaciones/megusta/${idPublicacion}/`, {
            data: { idUsuario: idUsuario }      // body de la petición DELETE, pasamos el id del usuario que quita el like
        });
        return response.data; // Devuelve el nuevo contador
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al quitar like');
    }
};

// --- MIEMBROS Y MEMBRESÍA ---

// Obtener los miembros de una comunidad específica.
export async function getMiembrosComunidad(idComunidad) {
    // GET /comunidad/miembros/{idComunidad}/
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/miembros/${idComunidad}/`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener los miembros');
    }
};

// Permite al usuario con sesión iniciada unirse a una comunidad específica.
export async function unirseComunidad(idComunidad, idUsuario) {
    // POST /comunidad/miembros/{idComunidad}/
    try {
        const response = await axios.post(`${BASE_URL_COMUNIDADES}/miembros/${idComunidad}/`, {
            idUsuario: idUsuario
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al unirse a la comunidad');
    }
};

// Permite al usuario con sesión iniciada salir de una comunidad específica.
export async function salirComunidad(idComunidad, idUsuario) {
    // DELETE /comunidad/miembros/{idComunidad}/{idUsuario}/
    try {
        await axios.delete(`${BASE_URL_COMUNIDADES}/miembros/${idComunidad}/${idUsuario}/`);
        return true;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al salir de la comunidad');
    }
};

// --- GESTIÓN DE PALABRAS VETADAS (Artista) ---

// Obtener palabras vetadas de una comunidad.
export const getPalabrasVetadas = async (idComunidad) => {
    const response = await axios.get(`${BASE_URL_COMUNIDADES}/${idComunidad}/palabras-vetadas/`);
    // El DTO devuelve { "palabrasVetadas": ["palabra1", "palabra2", ...] }
    return response.data.palabras || [];
};

// Añadir una palabra vetada a la comunidad.
export const addPalabraVetada = async (idComunidad, palabra) => {
    // POST /comunidad/{idComunidad}/palabras-vetadas/
    // El controlador espera: { "palabras": ["nueva"] } para añadir
    const response = await axios.post(`${BASE_URL_COMUNIDADES}/${idComunidad}/palabras-vetadas/`, {
         data: { palabras: [palabra] }  // cuerpo de la petición
        });
    return response.data.palabras;
};

// Eliminar una palabra vetada de la comunidad.
export const eliminarPalabraVetada = async (idComunidad, palabra) => {
    // DELETE /comunidad/{idComunidad}/palabras-vetadas/
    const response = await axios.delete(`${BASE_URL_COMUNIDADES}/${idComunidad}/palabras-vetadas/`, {
        data: { palabras: [palabra] }   // cuerpo de la petición
    });
    return response.data.palabras;
};

// --- GESTIÓN DE USUARIOS VETADOS (Artista Admin) ---

// Obtener usuarios vetados de una comunidad.
export const getUsuariosVetadosIds = async (idComunidad) => {
    // GET /comunidad/vetados/{idComunidad}/
    const response = await axios.get(`${BASE_URL_COMUNIDADES}/vetados/${idComunidad}/`);
    return response.data; 
};

// Vetar a un usuario en una comunidad.
export const vetarUsuario = async (idComunidad, idUsuarioAVetar) => {
    // POST /comunidad/vetados/{idComunidad}/
    await axios.post(`${BASE_URL_COMUNIDADES}/vetados/${idComunidad}/`, 
        { idUsuario: idUsuarioAVetar });
    return true;
};

// Quitar veto a un usuario en una comunidad.
export const quitarVetoUsuario = async (idComunidad, UsuarioAQuitar) => {
    // DELETE /comunidad/vetados/{idComunidad}/{idUsuarioAQuitar}/
    console.log ("Intentando quitar veto a usuario", UsuarioAQuitar, "en comunidad", idComunidad);
     await axios.delete(`${BASE_URL_COMUNIDADES}/vetados/${idComunidad}/${UsuarioAQuitar}/`, {
    });
    return true;
};