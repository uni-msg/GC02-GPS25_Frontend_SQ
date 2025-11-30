import { BASE_URL_USUARIOS } from "../config"; // Empleado para la llamada a la API
import axios from 'axios'; // Llamadas a la API sin emplear fetch

/**
 * Obtiene todos los elementos de la cesta que pertenece al usuario segun el id.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario en la cesta.
 * @returns {Promise<Object[]>} Lista de elementos en la cesta en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getCestaId(token,id) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/cesta/${id}`, {
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
 * El elemento esta ya en la cesta?.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} idusuario - Identificador del usuario en la cesta.
 * @param {string} idelemento - Identificador del elemento en la cesta.
 * @returns {Promise<boolean>} Lista de elementos en la cesta en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function exitElementoCesta(token,idusuario, idelemento) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/cesta/${idusuario}/${idelemento}`, {
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
 * Añade un nuevo elemento a la cesta.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postElementoCesta(token, cestaData) {
    try {
        console.log("Enviando a cesta:", cestaData); // Descomenta para depurar si hace falta
        const response = await axios.post(`${BASE_URL_USUARIOS}/cesta`, 
            cestaData, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' // <--- ESTO ES CRUCIAL
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
        const response = await axios.delete(`${BASE_URL_USUARIOS}/cesta/${idusuario}/${idelemento}`, {
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
 * Añade la cesta a comprado.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postTiene(token,id) {
    try {
        const response = await axios.post(`${BASE_URL_USUARIOS}/tiene/${id}`,
            null,
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