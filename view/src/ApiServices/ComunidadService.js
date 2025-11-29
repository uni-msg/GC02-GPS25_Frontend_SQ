import axios from 'axios';
import { BASE_URL_COMUNIDADES } from '../config'; // llamada a la api

// --- COMUNIDADES ---

export async function getComunidades() {
    try {
        // Usamos la variable importada
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
            idUsuario: idUsuario
        });
        return response.data; // Devuelve el nuevo contador
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al dar like');
    }
};

export async function quitarLikePublicacion(idPublicacion, idUsuario) {
    try {
        // Para DELETE con body en axios se usa la propiedad 'data'
        const response = await axios.delete(`${BASE_URL_COMUNIDADES}/publicaciones/megusta/${idPublicacion}/`, {
            data: { idUsuario: idUsuario }
        });
        return response.data; // Devuelve el nuevo contador
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al quitar like');
    }
};