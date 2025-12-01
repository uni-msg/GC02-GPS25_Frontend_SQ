import { BASE_URL_ESTADISTICAS } from "../config"; 
import axios from 'axios'; 

const API_URL = `${BASE_URL_ESTADISTICAS}/estadisticas`;

// ==========================================
//                 ARTISTAS
// ==========================================

/**
 * Obtiene la lista completa de artistas con sus estadísticas (oyentes, valoración).
 * Público.
 */
export async function getTodosArtistas() {
    try {
        const response = await axios.get(`${API_URL}/artistas/oyentes`);
        return response.data;
    } catch (error) {
        console.error("Error en getTodosArtistas:", error);
        throw error;
    }
}

/**
 * Obtiene las estadísticas de un artista específico por ID.
 * Público.
 */
export async function getArtistaById(id) {
    try {
        const response = await axios.get(`${API_URL}/artistas/oyentes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error en getArtistaById (${id}):`, error);
        throw error;
    }
}

/**
 * Fuerza la sincronización de un artista.
 * (Mantenemos token por si acaso es operación protegida)
 */
export async function syncArtista(token, idArtista) {
    try {
        const response = await axios.put(`${API_URL}/artistas/oyentes`, 
            { idArtista: parseInt(idArtista) },
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error en syncArtista:", error);
        throw error;
    }
}

/**
 * Elimina las estadísticas de un artista.
 */
export async function deleteArtistaStats(token, id) {
    try {
        const response = await axios.delete(`${API_URL}/artistas/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data;
    } catch (error) {
        console.error("Error en deleteArtistaStats:", error);
        throw error;
    }
}

/**
 * Obtiene el ranking global de artistas por número de oyentes.
 * Público - Sin Token.
 */
export async function getRankingArtistasOyentes() {
    try {
        const response = await axios.get(`${API_URL}/artistas/ranking/oyentes`);
        return response.data;
    } catch (error) {
        console.error("Error en getRankingArtistasOyentes:", error);
        throw error;
    }
}

/**
 * Registra una búsqueda (visita) a un artista.
 */
export async function registrarBusquedaArtista(token, idArtista, idUsuario = null) {
    try {
        const body = { idArtista: parseInt(idArtista) };
        if (idUsuario) body.idUsuario = parseInt(idUsuario);

        const response = await axios.put(`${API_URL}/artistas/busqueda`, body, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data;
    } catch (error) {
        console.error("Error en registrarBusquedaArtista:", error);
        throw error;
    }
}

/**
 * Obtiene el TOP de artistas más buscados.
 * Público - Sin Token.
 */
export async function getTopArtistasBusquedas(limit = 10) {
    try {
        const response = await axios.get(`${API_URL}/artistas/top`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error("Error en getTopArtistasBusquedas:", error);
        throw error;
    }
}

// ==========================================
//                 CONTENIDOS
// ==========================================

/**
 * Obtiene todos los contenidos almacenados en estadísticas.
 * Público.
 */
export async function getTodosContenidos() {
    try {
        const response = await axios.get(`${API_URL}/contenido`);
        return response.data;
    } catch (error) {
        console.error("Error en getTodosContenidos:", error);
        throw error;
    }
}

/**
 * Obtiene estadísticas de un contenido específico.
 * Público.
 */
export async function getContenidoById(id) {
    try {
        const response = await axios.get(`${API_URL}/contenido/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error en getContenidoById (${id}):`, error);
        throw error;
    }
}

/**
 * Sincroniza un contenido específico.
 */
export async function syncContenido(token, idContenido) {
    try {
        const response = await axios.put(`${API_URL}/contenido`, 
            { idContenido: parseInt(idContenido) },
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        return response.data;
    } catch (error) {
        console.error("Error en syncContenido:", error);
        throw error;
    }
}

export async function deleteContenidoStats(token, id) {
    try {
        const response = await axios.delete(`${API_URL}/contenido/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data;
    } catch (error) {
        console.error("Error en deleteContenidoStats:", error);
        throw error;
    }
}

/**
 * Top contenidos mejor valorados.
 * Público - Sin Token.
 */
export async function getTopContenidosValoracion(limit = 10) {
    try {
        const response = await axios.get(`${API_URL}/contenidos/valoracion/top`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error("Error en getTopContenidosValoracion:", error);
        throw error;
    }
}

/**
 * Top contenidos más comentados.
 * Público - Sin Token.
 */
export async function getTopContenidosComentarios(limit = 10) {
    try {
        const response = await axios.get(`${API_URL}/contenidos/comentarios/top`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error("Error en getTopContenidosComentarios:", error);
        throw error;
    }
}

/**
 * Top contenidos más vendidos.
 * Público - Sin Token.
 */
export async function getTopContenidosVentas(limit = 10) {
    try {
        const response = await axios.get(`${API_URL}/contenidos/ventas/top`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error("Error en getTopContenidosVentas:", error);
        throw error;
    }
}

/**
 * Top géneros con más ventas.
 * Público - Sin Token.
 */
export async function getTopGeneros(limit = 5) {
    try {
        const response = await axios.get(`${API_URL}/contenidos/genero/top`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error("Error en getTopGeneros:", error);
        throw error;
    }
}

// ==========================================
//                 COMUNIDAD
// ==========================================

/**
 * Obtiene todas las comunidades en estadísticas.
 * Público.
 */
export async function getTodasComunidades() {
    try {
        const response = await axios.get(`${API_URL}/comunidad`);
        return response.data;
    } catch (error) {
        console.error("Error en getTodasComunidades:", error);
        throw error;
    }
}

/**
 * Obtiene una comunidad por ID.
 * Público.
 */
export async function getComunidadById(id) {
    try {
        const response = await axios.get(`${API_URL}/comunidad/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error en getComunidadById (${id}):`, error);
        throw error;
    }
}

/**
 * Sincroniza una comunidad.
 */
export async function syncComunidad(token, idComunidad) {
    try {
        const response = await axios.put(`${API_URL}/comunidad`, 
            { idComunidad: idComunidad },
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        return response.data;
    } catch (error) {
        console.error("Error en syncComunidad:", error);
        throw error;
    }
}

export async function deleteComunidadStats(token, id) {
    try {
        const response = await axios.delete(`${API_URL}/comunidad/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data;
    } catch (error) {
        console.error("Error en deleteComunidadStats:", error);
        throw error;
    }
}

/**
 * Top comunidades con más miembros.
 * Público - Sin Token.
 */
export async function getRankingComunidadesMiembros() {
    try {
        const response = await axios.get(`${API_URL}/comunidad/ranking/miembros`);
        return response.data;
    } catch (error) {
        console.error("Error en getRankingComunidadesMiembros:", error);
        throw error;
    }
}

/**
 * Top comunidades con más publicaciones.
 * Público - Sin Token.
 */
export async function getRankingComunidadesPublicaciones() {
    try {
        const response = await axios.get(`${API_URL}/comunidad/ranking/publicaciones`);
        return response.data;
    } catch (error) {
        console.error("Error en getRankingComunidadesPublicaciones:", error);
        throw error;
    }
}

// ==========================================
//                REPRODUCCIONES
// ==========================================

/**
 * Registra que un usuario ha escuchado una canción/álbum.
 * Endpoint: PUT /reproducciones/registrar
 */
export async function registrarReproduccion(token, idUsuario, idContenido, segundos) {
    try {
        const body = {
            idUsuario: parseInt(idUsuario),
            idContenido: parseInt(idContenido),
            segundos: parseInt(segundos)
        };

        // Usamos PUT porque así está definido en tu backend (@router.put)
        const response = await axios.put(`${API_URL}/reproducciones/registrar`, body, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data;
    } catch (error) {
        console.error("Error en registrarReproduccion:", error);
        throw error;
    }
}

/**
 * Obtiene el historial completo de reproducciones de un usuario.
 * Endpoint: GET /reproducciones/usuario/{id}
 */
export async function getHistorialReproducciones(token, idUsuario) {
    try {
        const response = await axios.get(`${API_URL}/reproducciones/usuario/${idUsuario}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data; // Espera { status, count, data: [...] }
    } catch (error) {
        // Si devuelve 404 es que no tiene historial, devolvemos estructura vacía para no romper la UI
        if (error.response && error.response.status === 404) {
            return { status: "success", count: 0, data: [] };
        }
        console.error(`Error en getHistorialReproducciones (${idUsuario}):`, error);
        throw error;
    }
}

/**
 * Obtiene el TOP de canciones más escuchadas por el usuario.
 * Endpoint: GET /reproducciones/top/usuario/{id}?limit=X
 */
export async function getTopReproduccionesUsuario(token, idUsuario, limit = 10) {
    try {
        const response = await axios.get(`${API_URL}/reproducciones/top/usuario/${idUsuario}`, {
            params: { limit },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data; // Devuelve lista de ReproduccionDTO (donde segundos = contador)
    } catch (error) {
        // Si devuelve 404, devolvemos array vacío
        if (error.response && error.response.status === 404) {
            return [];
        }
        console.error(`Error en getTopReproduccionesUsuario (${idUsuario}):`, error);
        throw error;
    }
}