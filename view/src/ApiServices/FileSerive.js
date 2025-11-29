import { BASE_URL, CLOUD_URL} from "../config"; //empleado para la llamada a la api
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

export async function subirArchivo(archivo, folder, nombre) {

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", "unsigned_upload");
  formData.append("folder", folder);         // ejemplo: "fotos/" o "audios/mp3/"
  formData.append("public_id", nombre);      // sin extensión, ej: "ger"

  const res = await fetch(CLOUD_URL, {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Error subiendo archivo");

  return await res.json();
}


