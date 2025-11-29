import "./CrearElem.css";

import React, { useRef, useState, useEffect, useContext } from "react";
import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';
import logo from './../../Recursos/elementoDefecto.png';

import { getGeneros } from "./../../ApiServices/GeneroService"; 
import { subirArchivo } from "./../../ApiServices/FileSerive";
import { postElemento, getElementoById, putElemento } from "./../../ApiServices/ElementosService";
import { postCancion, putCancion } from "../../ApiServices/CancionesService.js";  
import { getGeneroById, getSubgeneroByElementoId, getGenerosPublic } from '../../ApiServices/GeneroService.js';
import { URL_FOTO  } from '../../config.js';
import PantallaCarga from "../Utiles/PantallaCarga/PantallaCarga.js";

const CrearElem = ({ datos = null, crearModo = false, manejarResultado }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(logo); // Usando el logo como imagen predeterminada
  const [error, setError] = useState(""); // Estado para manejar errores
  const [generos, setGeneros] = useState([]);
  const [cargando, setCargando] = useState(false);

  const {
    token,
    idLoggedIn,
  } = useContext(UsuarioContext);
  // let token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdjNzQ5NTFmNjBhMDE0NzE3ZjFlMzA4ZDZiMjgwZjQ4ZjFlODhmZGEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiUHJ1ZWJhQXJ0aXN0YTIiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdW5kZXJzb3VuZHMtZGMwZGQiLCJhdWQiOiJ1bmRlcnNvdW5kcy1kYzBkZCIsImF1dGhfdGltZSI6MTc2NDQwOTU2MSwidXNlcl9pZCI6IjkiLCJzdWIiOiI5IiwiaWF0IjoxNzY0NDA5NTYxLCJleHAiOjE3NjQ0MTMxNjEsImVtYWlsIjoicHJ1ZWJhYXJ0aXN0YTJAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsicHJ1ZWJhYXJ0aXN0YTJAZXhhbXBsZS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.ZFZA7ZoRcPD9db_rcGGrKAyjulab6Ufui0quYGTNaKhkiTDnlWhTaMZUUkrB0i8UBJyAYyVtK3Ap7bWU5K358126GG9Li53nEGhz04TPM5WZAhkrl6Q-VrTZbHTGwMYza2Muv05f6t6ng3j1lU88iN4kVW3T9-DA_gqPWnwAxOlQxOD7X3ex0y_KZ2QmbTlukpEXaRnAOGgs3yltAdlR0zRePbE8TFika4l_GMi9rG3g3zbekFuagJPkMrSv8ODJ7cX4hR3EPZBHC3VTW6a_3nrHG6D2lDvaNV1vFmRqcvTbFwnxVZAVeOAu0MRnHj9LjftJwlFGgi5690W7ZAdv5w";
  // let idLoggedIn = 1; // PARA PRUEBAS
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    precio: 0,
    esAlbum: false,
    idGenero: null,
    fotoFile: null,
    fotoAmazon: null,
    subgenero: null,
    idAlbum: null,
    archivoMp3: null,
    archivoWav: null,
    archivoFlac: null,
    nombreAmazon: null
  });

  /*
  useEffect(() => {
    console.log("Cambio prop 'datos':", datos);
  }, [datos]);

  useEffect(() => {
    console.log("DATOS FORMULARIO:", formData);
  }, [formData]);
  */

  useEffect(() => {
    const fetchData = async () => {
      if (datos == null || crearModo) return;
      setCargando(true); // Mostrar pantalla de carga
      try {
        const [genTmp, dataTmp, subgenero] = await Promise.all([
          getGeneros(token),
          getGeneroById(datos)
        ]);

        // Ajuste para cargar subgenero en modo edición si viene como array u objeto
        let subgeneroId = null;
        if (Array.isArray(subgenero) && subgenero.length > 0) {
           subgeneroId = subgenero[0].idgenero;
        } else if (subgenero?.idgenero) {
           subgeneroId = subgenero.idgenero;
        }

        setGeneros(genTmp);
        setFormData({
          ...dataTmp[0],
          subgenero: subgeneroId // Guardamos el ID único
        });

      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false); // Cerrar pantalla de carga
      }
    };

    fetchData();
  }, [datos, crearModo, token]);

  useEffect(() => {
    const fetchData = async () => {
      if (datos != null || !crearModo) return;

      try {
        const [genTmp] = await Promise.all([
          getGeneros(token),
        ]);

        setGeneros(genTmp);

      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    fetchData(); 

  }, [datos, crearModo, token]);


  useEffect(() => {
    if (formData.fotoAmazon && !crearModo) {
      setPreview(`${URL_FOTO}${formData.fotoAmazon}`);
    }
  }, [formData.fotoAmazon]);

  const clicPort = () => {
    inputRef.current.click();
  };

  const cambioPortada = (e) => {
    const file = e.target.files[0];
    if (file) { //si hay imagen
      const validTypes = ["image/jpeg", "image/png", "image/gif"]; // comprueba los tipos validos
      if (!validTypes.includes(file.type)) {
        setError("Por favor, selecciona una imagen válida (JPEG, PNG, GIF).");
        return;
      }
      setError(""); // Limpiar el mensaje de error si el archivo es válido

      setFormData({ ...formData, fotoFile: file }); //copia el formualrio de dato entero menos la
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const manejarArchivosAudio = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const cambios = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData, //copia los fatos del formulario entero
      [name]: type === "checkbox" ? checked : value
    });
  };

  const enviarElemento = async (e) => {
    e.preventDefault();
    setCargando(true); // Mostrar pantalla de carga
    try {
      if (crearModo) { //creamos un nuevo elemento
        if (!formData.fotoFile) {
          alert("Debe colocar una imagen de canción");
          return;
        }

        const urlCloud = formData.nombre.toLowerCase().replace(/\s+/g, '') + '_' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const extensionFoto = formData.fotoFile.name.split('.').pop().toLowerCase();
        // Prepara datos para el elemento (sin archivos, solo metadata)
        const elementoData = {
        artista: Number(idLoggedIn),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        esalbum: Boolean(formData.esAlbum),
        genero: Number(formData.idGenero),
        urlFoto: `${urlCloud}.${extensionFoto}`,
        subgenero: Number(formData.subgenero),
        idAlbum: formData.esAlbum ? null : (
          formData.idAlbum ? Number(formData.idAlbum) : null
        ),
        nombreAudio: urlCloud 
      };


        // Subir los datos del elemento como parámetros (body)
        if(elementoData.esalbum) {
            const subidaElemento = await postElemento(token, elementoData);
            console.log("Elemento subido:", subidaElemento);
        }
        else {
            const subidaElemento = await postCancion(token, elementoData);
            console.log("Elemento subido:", subidaElemento);
        }
        

        // Lista de archivos a subir con sus claves
        const archivos = [
          { key: 'fotoFile', tipo: 'foto' },
          { key: 'archivoMp3', tipo: 'mp3' },
          { key: 'archivoFlac', tipo: 'flac' },
          { key: 'archivoWav', tipo: 'wav' }
        ];

        for (const archivoInfo of archivos) {
          const originalFile = formData[archivoInfo.key];
          if (!originalFile) continue;

          const extension = originalFile.name.split('.').pop();
          const renamedFile = new File([originalFile], `${urlCloud}.${extension}`, {
            type: originalFile.type,
          });

          let carpeta = "";
          
          switch (extension) {
            case "mp3":
              carpeta = "mp3/";
              break;
            case "flac":
              carpeta = "flac/";
              break;
            case "wav":
              carpeta = "wav/";
              break;
            case "jpg":
            case "jpeg":
            case "png":
              carpeta = "fotos/";
              break;
            default:
              carpeta = "default/";
          }
          
          const subidaArchivo = await subirArchivo(renamedFile, carpeta, urlCloud); // se suben con el nombre renombrado sin espacios y sin la extension
        }
        manejarResultado?.({ codigo: 1, mensaje: "Elemento creado exitosamente." });
      } else { //actualizar informacion del usuario
        //console.log("actualizo elemento")
        const elementoData = { //no quiero que toque ni el nombre de amazon ni la foto de amazon porque usare el mismo
          id: datos,
          precio: formData.precio,
          descripcion: formData.descripcion,
        };
        //console.log("elemento act:", elementoData)
        if (formData.esAlbum) {
          const putEle = await putElemento(token, elementoData);
          console.log(`Archivo actualizado`, putEle);
        } else {
          const putEle = await putCancion(token, elementoData);
          console.log(`Archivo actualizado`, putEle);
        }
        
        //se emplea para las notificaciones
        manejarResultado?.({ codigo: 2, mensaje: "Elemento actualizado correctamente." });
      }

    } catch (error) {
      console.error("Error al subir o crear el elemento:", error);
    }finally {
      setCargando(false); // Siempre apagar la pantalla de carga
    }
  };


  return (
    <>
      <form id="crear-form" onSubmit={enviarElemento} encType="multipart/form-data">
        <h2>{crearModo ? "Crear" : "Editar"} {formData.esAlbum ? "album" : "cancion"}</h2>

        <div id="fotoCrearElem">
          <img src={preview} alt="Haz clic para cambiar la imagenes de perfil" onClick={clicPort} />
          <input type="file" accept="image/*" name="fotoFile" style={{ display: "none" }} ref={inputRef} onChange={cambioPortada} />
          <p className="mb-0">Haz clic en la imagen para cambiarla</p>
        </div>
        {error && <p className="text-danger">{error}</p>}

        <div id="esAlbumContainer" >
          <label>¿Es álbum?</label>
          <label className={`switch ${(!crearModo) ? "disabledLab" : ""}`}>
            <input
              type="checkbox"
              name="esAlbum"
              checked={formData.esAlbum}
              onChange={cambios}
              disabled={!crearModo}
            />
            <span className={`slider round ${(!crearModo) ? "disabledLab" : ""}`}></span>
          </label>
        </div>

        <label>Nombre *</label>
        <input name="nombre" value={formData.nombre} onChange={cambios} required disabled={!crearModo} />

        <label>Precio *</label>
        <input type="number" name="precio" step="0.01" min="0" max="1000" value={formData.precio} onChange={cambios} required />

        <label>Descripción *</label>
        <textarea name="descripcion" value={formData.descripcion} onChange={cambios} required />

        <label>Género *</label>
        <select name="idGenero" value={formData.idGenero || ""} onChange={cambios} required disabled={!crearModo}>
          <option value="" disabled>Selecciona un género</option>
          {generos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>

        <div id="subgenContainer" className="card-body text-center">
          {generos.map((g) => (
            <label key={g.id || g.idgenero} className="check">
              <input
                type="radio"                
                name="subgenero"            
                value={g.id || g.idgenero}
                
                // Verifica si el ID coincide con el seleccionado en el estado
                checked={formData.subgenero === (g.id || g.idgenero)}
                
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    subgenero: value // CORREGIDO: Actualiza la propiedad singular, no un array 'subgeneros'
                  }));
                }}
                disabled={!crearModo}
              />
              <span className={`${(!crearModo) ? "disabledLab" : ""}`}>{g.name || g.nombre}</span>
            </label>
          ))}
        </div>

        {!formData.esAlbum ?
          <div id="arcCan">
            <div>
              <label> MP3 </label>
              <input type="file" name="archivoMp3" accept=".mp3" required={crearModo} onChange={manejarArchivosAudio} />
            </div>

            <div>
              <label> WAV </label>
              <input type="file" name="archivoWav" accept=".wav" required={crearModo} onChange={manejarArchivosAudio} />
            </div>

            <div>
              <label> FLAC </label>
              <input type="file" name="archivoFlac" accept=".flac" required={crearModo} onChange={manejarArchivosAudio} />
            </div>
          </div> :
          <></>
        }

        <button type="submit">{crearModo ? "Crear" : "Guardar"} {formData.esAlbum ? "album" : "cancion"}</button>
      </form>
      {cargando && <PantallaCarga mensaje="Procesando elemento..." />}
    </>
  );
};

export default CrearElem;