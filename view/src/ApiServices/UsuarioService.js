import { BASE_URL_USUARIO } from "../config"; //empleado para la llamada a la api
import axios from 'axios'; //llamadas a la api sin emplear el fetch

/**
 * Obtiene el usuario solo con el token.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @returns {Promise<Object>} Lista de géneros en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function login(token) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIO}/login`, {
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
 * Cierra la sesion de un usuario segun el token.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @returns {Promise<Object>} Lista de géneros en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function logout(token) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIO}/logout`, {
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
 * Añade un nuevo usuario a la base de datos y firebase
 * 
 * @param {Object} usuarioData - Datos del usuario a cambiar.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postUsuario(usuarioData) {
    try {
        const response = await axios.post(`${BASE_URL_USUARIO}/`, 
            usuarioData,  // Datos del usuario
        );
        return response.data;   // devuelve la respuesta del endpoint como Promise
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Modifica los datos del usuario segun el id.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} usuarioData - Datos del usuario a cambiar.
 * @returns {Promise<Object>} - Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function putUsuario(token,usuarioData) {
    try {
        const response = await axios.put(`${BASE_URL_USUARIO}/`, 
            usuarioData,  // Datos del usuario
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
 * Elimina el usuario segun el id
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteUsuario(token,id) {
    try {
        const response = await axios.delete(`${BASE_URL_USUARIO}/${id}`,
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
 * Obtiene todos los usuarios desde la base de datos.
 * 
 * @returns {Promise<Object[]>} Lista de usuarios en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getUsuarios() {
    try {
        const response = await axios.get(`${BASE_URL_USUARIO}/`, { });
        return response.data;  // devuelve la respuesta del endpoint como Promise
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Obtiene el usuario segun id dado.
 * 
 * @param {string} id - Identificador del usuario.
 * @returns {Promise<Object>} Lista de géneros en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getUsuarioById(id) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIO}/${id}`, );
        return response.data;  // devuelve la respuesta del endpoint como Promise
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}  

//              ----------------------- PARA LAS RELACIONES DE LOS USUARIOS A LOS USUARIOS -----------------------------------
// FAVORITOS
/**
 * Obtiene los artistas favoritos del usuario segun id dado.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @returns {Promise<Object>} Lista de artistas en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getFavoritosById(token,id) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIO}/artistas_usuarios?usuario_id=${id}`, {
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
 * Obtiene una relacion de favorito especifica.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @param {string} idart - Identificador del artista.
 * @returns {Promise<Object>} Lista de artistas en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getFavoritosByIds(token,id,idart) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIO}/artistas_usuarios?usuario_id=${id}&&id_artista=${idart}`, {
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
 * Añade una nueva relacion de usuario y artistas como favorito
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} relacinoData - Datos de la relacion a añadir.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postFavorito(token,relacinoData) {
    try {
        const response = await axios.post(`${BASE_URL_USUARIO}/artistas_usuarios`,
            relacinoData,  // Datos del usuario
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
 * Elimina el favorito del usuario al artista idart
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @param {string} idart - Identificador del artista.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteFavorito(token,id,idart) {
    try {
        const response = await axios.delete(`${BASE_URL_USUARIO}/artistas_usuarios?usuario_id=${id}&&id_artista=${idart}`,
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

//Relación usuario tiene elemento 
/**
 * Verifica si un usuario tiene un elemento (lo ha comprado).
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} idusuario - ID del usuario.
 * @returns {Promise<Object[]>} Lista de coincidencias (vacía si no tiene el elemento).
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getUsuarioTieneElementoById(token, idusuario) {
    try {
      const response = await axios.get(`${BASE_URL_USUARIO}/usuario_tiene_elemento?idusuario=${idusuario}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluye el token
        },
      });
      return response.data; // Devuelve la lista de coincidencias
    } catch (error) {
      console.error("Error al verificar si el usuario tiene el elemento:", error);
      throw error;
    }
  }
  