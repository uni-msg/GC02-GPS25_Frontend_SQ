import { BASE_URL, BASE_URL_CONTENIDO, BASE_URL_USUARIOS } from "../config"; // Empleado para la llamada a la API
import axios from 'axios'; // Llamadas a la API sin emplear fetch

/**
 * Obtiene todos los elementos desde la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @returns {Promise<Object[]>} Lista de elementos en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getElementos(token) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/contenidos`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: "text", // <- clave aquí
        });

        const rawJson = response.data;
        console.log("JSON crudo (string):", rawJson);

        // Parseo manual del JSON, si lo necesitás como objeto
        const parsed = JSON.parse(rawJson);
        return parsed;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}


/**
 * Obtiene un elemento según el ID dado.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del elemento.
 * @returns {Promise<Object>} Elemento en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getElementoById(token, id) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/elementos/${id}`, {
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
 * Obtiene los elementos creados por el artista dado como id.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del elemento.
 * @returns {Promise<Object>} Elemento en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getCancionesArtistas(token, id) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/canciones/artista/${id}`, {
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

export async function getElementosArtistasP(id) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/elementos/artista/${id}`, {
            params: { id: id }
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function getElementosGeneroP(id) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/elementos/genero/${id}`, {
            params: { id: id }
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Modifica los datos del elemento según el ID.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} elementoData - Datos del elemento a modificar.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function putElemento(token, elementoData) {
    try {
        const response = await axios.put(`${BASE_URL_CONTENIDO}/elementos`,
            null,
            {
                elementoData,
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
 * Añade un nuevo elemento a la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} elementoData - Datos del nuevo elemento.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postElemento(token, elementoData) {
    try {
        const response = await axios.post(`${BASE_URL_CONTENIDO}/elementos`,
            elementoData,
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
 * Añade un nuevo elemento a la base de datos.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} elementoData - Datos del nuevo elemento.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postElementoParam(token, elementoData) {
    try {
        const response = await axios.post(`${BASE_URL_CONTENIDO}/elementos`,
            null,
            {
                params: elementoData,
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
 * Elimina un elemento según el ID.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del elemento.
 * @returns {Promise<Object>} Información de la acción en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteElemento(token, id) {
    try {
        const response = await axios.delete(`${BASE_URL_CONTENIDO}/elementos?id=${id}`, {
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
 * Obtiene todos los elementos según los filtros aplicables.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} filtro - Objeto con los datos para aplicar filtros.
 * @returns {Promise<Object[]>} Lista de elementos filtrados en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getElementosFiltra(token, filtro) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/elementos`, {
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

//              ----------------------- PARA LAS RELACIONES DE LOS USUARIOS A LOS ELEMENTOS -----------------------------------
//PROPIEDAD
/**
 * Obtiene los elemento que TIENE el user ID .
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @returns {Promise<Object[]>} Lista de elementos filtrados en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getElementoPropios(token, id) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/usuario_tiene_elemento?idusuario=${id}`, {
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
 * Obtiene los elemento que TIENE el user ID según los filtros aplicables.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @param {Object} filtro - Objeto con los datos para aplicar filtros.
 * @returns {Promise<Object[]>} Lista de elementos filtrados en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getElementoPropiosFiltra(token, id, filtro) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/usuario_tiene_elemento?idusuario=${id}`, {
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
 * Inserta los elementos comprados al usuario.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @param {Object} filtro - Objeto con los datos para aplicar filtros.
 * @returns {Promise<Object[]>} Lista de elementos filtrados en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postElementosTiene(token, idusuario, idelemento) {

    console.log("tokenUs:", token);
    console.log("idUsr:", idusuario);
    console.log("idElem", idelemento);

    const requestBody = {
        idusuario: idusuario,
        idelemento: idelemento
    };

    console.log("Request Body JSON:", requestBody);

    try {

        const response = await axios.post(
            `${BASE_URL_CONTENIDO}/usuario_tiene_elemento`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al agregar el elemento:", error);
        throw new Error('Error al agregar el elemento: ' + error.message);
    }
}

// DESEA
/**
 * Obtiene los elementos deseados del usuario segun id dado.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @returns {Promise<Object>} Lista de elementos en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getDeseosById(token, id) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/usuario_desea_elemento?idusuario=${id}`, {
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
 * Añade una nueva relacion de usuario y elemento como deseadp
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} relacinoData - Datos de la relacion a añadir.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postDeseo(token, relacinoData) {
    try {
        const response = await axios.post(`${BASE_URL_USUARIOS}/usuario_desea_elemento`,
            relacinoData,
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
 * Elimina el elemento deseado del usuario segun el idelem
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @param {string} idelem - Identificador del elemento.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteDeseo(token, id, idelem) {
    try {
        const response = await axios.delete(`${BASE_URL_USUARIOS}/usuario_desea_elemento?idusuario=${id}&&idelemento=${idelem}`,
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

// VALORA
/**
 * Obtiene los elementos valorados del usuario segun id dado. //ESTO NO EXITE 
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @returns {Promise<Object>} Lista de elementos en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getValoracionesById(token, id) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/usuarioValoraElem?id=${id}`, {
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
 * Obtiene los elementos valorados segun el idelem del elemento.
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} idelem - Identificador del elemento.
 * @returns {Promise<Object>} Lista de elementos en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getValoracionesByIdelem(idelem) {
    try {
        const response = await axios.get(`${BASE_URL_CONTENIDO}/usuarioValoraElem?idelemento=${idelem}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Añade una nueva relacion de usuario y elemento como valorado
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {Object} relacinoData - Datos de la relacion a añadir.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function postValora(token, relacinoData) {
    try {
        const response = await axios.post(`${BASE_URL_CONTENIDO}/usuarioValoraElem`,
            relacinoData,
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
 * Elimina el elemento valorado del usuario segun el idelem
 * 
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {string} id - Identificador del usuario.
 * @param {string} idelem - Identificador del elemento.
 * @returns {Promise<Object>} Informacion de la accion formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function deleteValora(token, id, idelem) {
    try {
        const response = await axios.delete(`${BASE_URL_CONTENIDO}/usuarioValoraElem?id=${id}&&idelem=${idelem}`,
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
/////////////////////////////////// API EXTERNA ///////////////////////////
//Lyrics.ohv
/**
 * Obtiene la letra de un elemento según el ID dado.
 * 
 * @param {string} id - Identificador del elemento.
 * @returns {Promise<Object>} Elemento en formato JSON.
 * @throws {Error} Si ocurre un error en la solicitud HTTP.
 */
export async function getLetraById(id) {
    try {
        const response = await axios.get(`${BASE_URL}/letra?id=${id}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}