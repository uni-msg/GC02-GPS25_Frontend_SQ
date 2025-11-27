import { BASE_URL_USUARIOS } from "../config"; //empleado para la llamada a la api
import axios from 'axios'; //llamadas a la api sin emplear el fetch

/**
 * Obtiene todos los Artista musicales desde la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @returns {Promise<Object[]>} Lista de artistas en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getArtistas(token) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/artistas`, {
            headers: {
                Authorization: `Bearer ${token}`, // Enviamos el token 
            },
        });
        return response.data;  // devuelve la respuesta del endpoint como Promise
    } catch (error) {
        console.error("Error:", error);
        throw error;    
    }
}

/**
 * Obtiene el artista musical segun id dado.
 * 
 * @param {string} artista_id - Identificador del artista.
 * @returns {Promise<Object>} Lista de artistas en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getArtistaById(artista_id) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/artistas/${artista_id}`);
        return response.data;  
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Modifica los datos del artista segun el id.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del artista.
 * @param {Object} generoData - Datos del artista a cambiar.
 * @returns {Promise<Object>} - Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function putArtista(token,id,generoData) {
    try {
        const response = await axios.put(`${BASE_URL_USUARIOS}/artistas?id=${id}`, 
            generoData, 
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Enviamos el token
                },
            }
        );
        return response.data;   // devuelve la respuesta del endpoint como Promise
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Añade un nuevo artista a la base de datos
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} generoData - Datos del artista a cambiar.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postArtista(token,generoData) {
    try {
        const response = await axios.post(`${BASE_URL_USUARIOS}/artistas`, 
            generoData, 
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Enviamos el token
                },
            }
        );
        return response.data;   // devuelve la respuesta del endpoint como Promise
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Elimina el artista segun el id
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del artista.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteArtista(token,id) {
    try {
        const response = await axios.delete(`${BASE_URL_USUARIOS}/artistas?id=${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Enviamos el token
                },
            }
        );
        return response.data;   // devuelve la respuesta del endpoint como Promise
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Obtiene todos los artistas segun el filtro aplicable.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} filtro - Datos para que filtre.
 * @returns {Promise<Object[]>} Lista de artistas en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getArtistasFiltra(token, filtro) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/artistas`, { //se usa get porque no es un filtro demasiado amplio
            headers: {
                Authorization: `Bearer ${token}`, // Enviamos el token en el encabezado de la solicitud
            },
            params: filtro,  // Pasamos los filtros como parámetros en la solicitud GET
        });
        return response.data; // Devuelve la respuesta del endpoint, los datos del usuario
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Obtiene todas las canciones según los filtros aplicables.
 * 
 * @param {string} artista_id - Identificador del album.
 * @returns {Promise<Object[]>} Lista de canciones filtradas en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getArtistaByElemento(artista_id) {
    try {
      const response = await axios.get(`${BASE_URL_USUARIOS}/artistas/${artista_id}`);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

// CREAR ELEMENTOS 