import { BASE_URL } from "../config"; //empleado para la llamada a la api
import axios from 'axios'; //llamadas a la api sin emplear el fetch

/**
 * Sube un archivo al servidor.
 *
 * @param {string} token - Token de verificación de sesión (JWT).
 * @param {File} archivo - Archivo a subir.
 * @returns {Promise<Object>} Respuesta del servidor en formato JSON.
 * @throws {Error} Si ocurre un error durante la subida del archivo.
 */
export async function postArchivo(token, archivo) {
    try {
        const formData = new FormData();
        formData.append("archivo", archivo); // Asegúrate de que el "name" coincide con el backend

        const response = await axios.post(`${BASE_URL}/subir`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;  // Devuelve la respuesta del backend (incluye la URL del archivo)
    } catch (error) {
        console.error("Error al subir archivo:", error);
        throw error;
    }
}
