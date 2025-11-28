import { BASE_URL_CONTENIDO } from "../config"; // Empleado para la llamada a la API
import axios from 'axios'; // Llamadas a la API sin emplear fetch

/**
 * Obtiene todas las canciones desde la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @returns {Promise<Object[]>} Lista de canciones en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getCanciones(token) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/canciones`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Obtiene la canción según el ID dado.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador de la canción.
 * @returns {Promise<Object>} Canción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getCancionById(token, id) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/canciones/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Modifica los datos de la canción según el ID.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador de la canción.
 * @param {Object} cancionData - Datos de la canción a modificar.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function putCancion(token, id, cancionData) {
    try {
        const response = await axios.put(`${BASE_URL_CONTENIDO}/canciones/${id}`,
            cancionData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Añade una nueva canción a la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} cancionData - Datos de la canción a añadir.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postCancion(token, cancionData) {
    try {
        const response = await axios.post(`${BASE_URL_CONTENIDO}/canciones`,
            cancionData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Elimina una canción según el ID.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador de la canción.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteCancion(token, id) {
    try {
        const response = await axios.delete(`${BASE_URL_CONTENIDO}/canciones/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Obtiene todas las canciones según los filtros aplicables.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} filtro - Objeto con los datos para aplicar filtros.
 * @returns {Promise<Object[]>} Lista de canciones filtradas en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getCancionesFiltra(token, filtro) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/canciones`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: filtro,
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Obtiene todas las canciones según los filtros aplicables.
 * 
 * @param {string} idAlbum - Identificador del album.
 * @returns {Promise<Object[]>} Lista de canciones filtradas en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getCancionesByAlbum(idAlbum) {
    try {
      const response = await axios.get(`${BASE_URL_CONTENIDO}/canciones/album/${idAlbum}`);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  
