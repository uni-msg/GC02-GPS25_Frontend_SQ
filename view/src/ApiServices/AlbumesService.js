import { BASE_URL } from "../config"; // Empleado para la llamada a la API
import axios from 'axios'; // Llamadas a la API sin emplear fetch

/**
 * Obtiene todos los álbumes desde la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @returns {Promise<Object[]>} Lista de álbumes en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getAlbumes(token) {
    try {
        const response = await axios.get(`${BASE_URL}/albumes`, {
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
 * Obtiene un álbum según el ID dado.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del álbum.
 * @returns {Promise<Object>} Álbum en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getAlbumById(token, id) {
    try {
        const response = await axios.get(`${BASE_URL}/albumes?id=${id}`, {
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
 * Modifica los datos del álbum según el ID.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del álbum.
 * @param {Object} albumData - Datos del álbum a modificar.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function putAlbum(token, id, albumData) {
    try {
        const response = await axios.put(`${BASE_URL}/albumes?id=${id}`, 
            albumData,
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
 * Añade un nuevo álbum a la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} albumData - Datos del álbum a añadir.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postAlbum(token, albumData) {
    try {
        const response = await axios.post(`${BASE_URL}/albumes`, 
            albumData,
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
 * Elimina un álbum según el ID.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del álbum.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteAlbum(token, id) {
    try {
        const response = await axios.delete(`${BASE_URL}/albumes?id=${id}`, {
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
 * Obtiene todos los álbumes según los filtros aplicables.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} filtro - Objeto con los datos para aplicar filtros.
 * @returns {Promise<Object[]>} Lista de álbumes filtrados en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getAlbumesFiltra(token, filtro) {
    try {
        const response = await axios.get(`${BASE_URL}/albumes`, {
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
