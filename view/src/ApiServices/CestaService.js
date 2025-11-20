import { BASE_URL } from "../config"; // Empleado para la llamada a la API
import axios from 'axios'; // Llamadas a la API sin emplear fetch

/**
 * Obtiene todos los elementos de la cesta que pertenece al usuario drgun el id.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario en la cesta.
 * @returns {Promise<Object[]>} Lista de elementos en la cesta en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getCesta(token,id) {
    try {
        const response = await axios.get(`${BASE_URL}/getUsuarioCompraElemento?idusuario=${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        //console.log("Llegué a la funci´çon getCesta")
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Añade un nuevo elemento a la cesta.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {object} data - Datos del elemento a añadir a la cesta.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postElementoCesta(token, data) {
    try {
      const response = await axios.post(
        `${BASE_URL}/getUsuarioCompraElemento?idusuario=${data.idusuario}&idelemento=${data.idelemento}`,
        null, 
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
 * Elimina todos los elemento de la cesta según el ID del usuario.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario en la cesta.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteElementosCesta(token, id) {
    try {
        const response = await axios.delete(`${BASE_URL}/EliminarCesta?idusuario=${id}`, {
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
 * Elimina el elemento de la cesta según el ID del usuario y el ID del elmento.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} idusuario - Identificador del usuario en la cesta.
 * @param {string} idelemento - Identificador del elemento en la cesta.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteElementoCestaById(token, idusuario, idelemento) {
    try {
        const response = await axios.delete(`${BASE_URL}/getUsuarioCompraElemento?idusuario=${idusuario}&idelemento=${idelemento}`, {
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

// seria mas seguro elimina la relacion y poner una nueva
/**
 * Modifica un elemento de la cesta según el ID del usuario.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario en la cesta.
 * @param {Object} relacionData - Datos de la relacion a modificar.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function putElementoCesta(token, id, relacionData) {
    try {
        const response = await axios.put(`${BASE_URL}/cesta?id=${id}`, 
            relacionData,
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
 * Obtiene todos los elementos de la cesta que pertenece al usuario drgun el id.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} idusuario - Identificador del usuario en la cesta.
 * @returns {Promise<Object[]>} Lista de elementos en la cesta en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getCestaId(token,idusuario) {
    try {
        const response = await axios.get(`${BASE_URL}/getCestaUsuario?idusuario=${idusuario}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        //console.log("Llegué a la funci´çon getCestaId")
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Obtiene todos los elementos de la cesta que pertenece al usuario drgun el id.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} idusuario - Identificador del usuario en la cesta.
 * @returns {Promise<Object[]>} Lista de elementos en la cesta en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getPrecioCesta(token,idusuario) {
    try {
        const response = await axios.get(`${BASE_URL}/getPrecioCesta?idusuario=${idusuario}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        //console.log("Llegué a la funci´çon getPrecioCesta")
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}