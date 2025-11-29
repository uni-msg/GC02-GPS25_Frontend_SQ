import { BASE_URL_CONTENIDO } from "../config"; //empleado para la llamada a la api
import axios from 'axios'; //llamadas a la api sin emplear el fetch

/**
 * Obtiene todos los géneros musicales desde la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @returns {Promise<Object[]>} Lista de géneros en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getGeneros(token) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/generos`, {
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

export async function getGenerosPublic() {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/generos`);
        return response.data;  // devuelve la respuesta del endpoint como Promise
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Obtiene el género musical según el ID dado.
 * 
 * @param {string} id - Identificador del género.
 * @returns {Promise<Object>} Género en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getGeneroById(id) {
    try {
      const response = await axios.get(`${BASE_URL_CONTENIDO}/generos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  

/**
 * Modifica los datos del genero segun el id.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del genero.
 * @param {Object} generoData - Datos del genero a cambiar.
 * @returns {Promise<Object>} - Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function putGenero(token,id,generoData) {
    try {
        const response = await axios.put(`${BASE_URL_CONTENIDO}/generos/${id}`, 
            generoData,  // Datos del genero
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
 * Añade un nuevo genero a la base de datos
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} generoData - Datos del genero a cambiar.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postGenero(token,generoData) {
    try {
        const response = await axios.post(`${BASE_URL_CONTENIDO}/generos`, 
            generoData,  // Datos del genero
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
 * Elimina el genero segun el id
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del genero.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteGenero(token,id) {
    try {
        const response = await axios.delete(`${BASE_URL_CONTENIDO}/generos/${id}`,
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
