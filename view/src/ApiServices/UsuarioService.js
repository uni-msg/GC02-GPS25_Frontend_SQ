import { BASE_URL_USUARIOS} from "../config"; //empleado para la llamada a la api
import axios from 'axios'; //llamadas a la api sin emplear el fetch

// ======================================================================
// LOGIN
// ======================================================================

export async function login(token) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/login`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function logout(token) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/logout`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// ======================================================================
// CRUD USUARIO
// ======================================================================

export async function postUsuario(usuarioData) {
    try {
        const response = await axios.post(`${BASE_URL_USUARIOS}/`, usuarioData);
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function putUsuario(token, usuarioData) {
    try {
        const response = await axios.put(`${BASE_URL_USUARIOS}/`,
            usuarioData,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function deleteUsuario(token, id) {
    try {
        const response = await axios.delete(`${BASE_URL_USUARIOS}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function getUsuarios() {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/`);
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function getUsuarioById(id) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/${id}`);
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// ======================================================================
// FAVORITOS
// ======================================================================

export async function getFavoritosById(token, id) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/favoritos/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function getFavoritosByIds(token, idusuario, idelem, esArt) {
    try {
        const response = await axios.get(
            `${BASE_URL_USUARIOS}/favoritos/${idusuario}/${idelem}/${esArt ? "artista" : "contenido"}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function deleteFavorito(token, idusuario, idelem, esArt) {
    try {
        const response = await axios.delete(
            `${BASE_URL_USUARIOS}/favoritos/${idusuario}/${idelem}/${esArt ? "artista" : "contenido"}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function postFavorito(token, relacionData) {
    try {
        const response = await axios.post(`${BASE_URL_USUARIOS}/favoritos/`,
            relacionData,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// ======================================================================
// TIENE
// ======================================================================

export async function getUsuarioTieneElementoById(token, idusuario) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/tiene/${idusuario}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function getTieneByIds(token, idusuario, idelem) {
    try {
        const response = await axios.get(
            `${BASE_URL_USUARIOS}/tiene/${idusuario}/${idelem}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// ======================================================================
// DESEA
// ======================================================================

export async function getUsuarioDeseaElementoById(token, idusuario) {
    try {
        const response = await axios.get(`${BASE_URL_USUARIOS}/desea/${idusuario}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function getDeseaByIds(token, idusuario, idelem) {
    try {
        const response = await axios.get(
            `${BASE_URL_USUARIOS}/desea/${idusuario}/${idelem}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function deleteDesea(token, idusuario, idelem) {
    try {
        const response = await axios.delete(
            `${BASE_URL_USUARIOS}/desea/${idusuario}/${idelem}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function postDesea(token, relacionData) {
    try {
        const response = await axios.post(`${BASE_URL_USUARIOS}/desea/`,
            relacionData,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
