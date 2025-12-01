import axios from 'axios';
import { BASE_URL_COMUNIDADES } from '../config'; // llamada a la api

// --- COMUNIDADES ---

export async function getComunidades() {
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener las comunidades');
    }
};

export async function getComunidadById(idComunidad) {
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/${idComunidad}/`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener los detalles de la comunidad');
    }
};

// --- GESTIÓN DE LA COMUNIDAD (Artista) ---

export const actualizarComunidad = async (idComunidad, datosJson) => {
    const response = await axios.put(`${BASE_URL_COMUNIDADES}/${idComunidad}/`, datosJson);
    return response.data;
};  

export const eliminarComunidad = async (idComunidad) => {
    await axios.delete(`${BASE_URL_COMUNIDADES}/${idComunidad}/`);
    return true;
};

// --- PUBLICACIONES ---

export async function getPublicacionesComunidad(idComunidad) {
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

// --- GESTIÓN DE PUBLICACIONES (Artista) ---

export const crearPublicacion = async (idComunidad, datosJson) => {
    // POST /comunidad/publicaciones/{idComunidad}/ (Endpoints genéricos de publicaciones)
    const response = await axios.post(`${BASE_URL_COMUNIDADES}/publicaciones/${idComunidad}/`, datosJson);
    return response.data;
};

export const eliminarPublicacion = async (idComunidad, idPublicacion) => {
    // DELETE /comunidad/publicaciones/{idComunidad}/{idPublicacion}/
    await axios.delete(`${BASE_URL_COMUNIDADES}/publicaciones/${idComunidad}/${idPublicacion}/`);
    return true;
};

export const editarPublicacion = async (idComunidad, idPublicacion, datosJson) => {
    // PUT /comunidad/publicaciones/{idComunidad}/{idPublicacion}/
    const response = await axios.patch(`${BASE_URL_COMUNIDADES}/publicaciones/${idComunidad}/${idPublicacion}/`, datosJson);
    return response.data;
};

// --- LIKES EN PUBLICACIONES ---

export async function getLikesPublicacion(idPublicacion) {
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/publicaciones/megusta/${idPublicacion}/`);
        return response.data;
    } catch (error) {
        throw new Error('Error al verificar likes');
    }
};

export async function darLikePublicacion(idPublicacion, idUsuario) {
    try {
        const response = await axios.post(`${BASE_URL_COMUNIDADES}/publicaciones/megusta/${idPublicacion}/`, {
            data: { idUsuario: idUsuario }    // body de la petición POST, pasamos el id del usuario que da el like
        });
        return response.data; // Devuelve el nuevo contador
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al dar like');
    }
};

export async function quitarLikePublicacion(idPublicacion, idUsuario) {
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

export async function getMiembrosComunidad(idComunidad) {
    try {
        const response = await axios.get(`${BASE_URL_COMUNIDADES}/miembros/${idComunidad}/`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener los miembros');
    }
};

export async function unirseComunidad(idComunidad, idUsuario) {
    try {
        const response = await axios.post(`${BASE_URL_COMUNIDADES}/miembros/${idComunidad}/`, {
            idUsuario: idUsuario
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al unirse a la comunidad');
    }
};

export async function salirComunidad(idComunidad, idUsuario) {
    try {
        await axios.delete(`${BASE_URL_COMUNIDADES}/miembros/${idComunidad}/${idUsuario}/`);
        return true;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al salir de la comunidad');
    }
};

// --- GESTIÓN DE PALABRAS VETADAS (Artista) ---

export const getPalabrasVetadas = async (idComunidad) => {
    const response = await axios.get(`${BASE_URL_COMUNIDADES}/${idComunidad}/palabras-vetadas/`);
    // Asumimos que el DTO devuelve { "palabras": ["a", "b"] }
    return response.data.palabras || [];
};

export const addPalabraVetada = async (idComunidad, palabra) => {
    // El controlador espera: { "palabras": ["nueva"] } para añadir
    const response = await axios.post(`${BASE_URL_COMUNIDADES}/${idComunidad}/palabras-vetadas/`, { palabras: [palabra] });
    return response.data.palabras;
};

export const eliminarPalabraVetada = async (idComunidad, palabra) => {
    // axios.delete con body requiere la propiedad 'data'
    const response = await axios.delete(`${BASE_URL_COMUNIDADES}/${idComunidad}/palabras-vetadas/`, {
        data: { palabras: [palabra] }
    });
    return response.data.palabras;
};

// --- GESTIÓN DE USUARIOS VETADOS (Artista) ---

// Obtener IDs de usuarios vetados
export const getUsuariosVetadosIds = async (idComunidad) => {
    // Asumimos un endpoint que devuelve una lista de IDs: [1, 5, 20]
    const response = await axios.get(`${BASE_URL_COMUNIDADES}/vetados/${idComunidad}/`);
    return response.data; 
};

export const vetarUsuario = async (idComunidad, idUsuarioAVetar) => {
    await axios.post(`${BASE_URL_COMUNIDADES}/vetados/${idComunidad}/`, 
        { idUsuario: idUsuarioAVetar });
    return true;
};

export const quitarVetoUsuario = async (idComunidad, idUsuarioAQuitar) => {
     await axios.delete(`${BASE_URL_COMUNIDADES}/vetados/${idComunidad}/${idUsuarioAQuitar}`, {
    });
    return true;
};