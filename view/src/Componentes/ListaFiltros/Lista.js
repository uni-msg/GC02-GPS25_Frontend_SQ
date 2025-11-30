import './Lista.css';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ListaVacia from '../Utiles/ListaVacia/ListaVacia';
import { URL_FOTO, CLOUD_URL_DEFAULT, URL_MP3, URL_WAV, URL_FLAC } from '../../config.js';

const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
     <i
       key={i}
       className={
         i < rating
           ? "bi bi-file-music-fill text-info my-icon" // Icono lleno
           : "bi bi-file-music text-info my-icon"      // Icono vacío
       }
     />
   ));
};

function ListaFiltro({ elementosDatos = [], titulo = "Deseos", descarga = false }) { // por defecto tendremos una lista vacia
/* Trae todos los productos del catalogo */ 
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(false);
    setDatos(elementosDatos);
  }, [elementosDatos]);

    return (
        <>
            {elementosDatos.length === 0 ? 
                (
                    <ListaVacia mensaje={`Tu lista de ${titulo} está vacía por ahora`}/>
                ): (
                    <div id='listaElem' className='d-flex justify-content-center flex-wrap align-self-center'>
                        {cargando ? (
                            <p>Cargando...</p>
                        ) : (
                            <>
                                {
                                    (Array.isArray(datos[0]) ? datos.flat() : datos).map((itemPeq, index) => {
                                        const esArtista = itemPeq.esartista === true;
                                        const esAlbum = itemPeq.esalbum === true;

                                        if (esArtista) {
                                            return <ElementoPer key={index} item={itemPeq} />;
                                        }

                                        return <Elemento key={index} item={itemPeq} descarga={descarga} esAlbum={esAlbum} />;
                                    })
                                }
                            </>
                        )}
                    </div>
                )
            }
        </>
    )
}

//crearemos un link con el archivo y se eliminara al pulsar el tipo que queramos
const descargarArchivo = (nombre,tipo = "mp3") => {
    let archivo ;
    switch (tipo) {
        case "mp3":
            archivo = `${URL_MP3}${nombre}`;
            break;
        case "flac":
            archivo = `${URL_FLAC}${nombre}`;
            break;
        case "wav":
            archivo = `${URL_WAV}${nombre}`;
            break;
        default:
            archivo = `${URL_MP3}${nombre}`;
            break;
    }
    const link = document.createElement("a");
    link.href = archivo;
    link.target = "_blank";
    link.download = nombre+'.'+tipo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const getFoto = (item) => {
    return item.fotoAmazon || item.rutafoto || item.urlFoto
        ? `${URL_FOTO}${item.fotoAmazon || item.rutafoto || item.urlFoto}`
        : CLOUD_URL_DEFAULT;
};

function Elemento({ item, descarga = false, esAlbum }) {
    const navigate = useNavigate();
    const [mostrarModal, setMostrarModal] = useState(false);

    const handleClick = () => navigate(item.esalbum ? "/masInfoAlbum" : "/masInfo", { state: item });
    
return (
    <div className="card" >
        <div className="botonesAccion d-flex justify-content-between">
            <i className="fa-solid fa-plus" onClick={handleClick}></i>
            {descarga && !esAlbum && <i className="fa-solid fa-download" onClick={() => setMostrarModal(true)}></i>}
            <i className="fa-solid fa-share-nodes"></i>
        </div>
        <img 
            src={getFoto(item)}
            className={`card-img-top ${!esAlbum ?"card-img-rounded":"card-img-square"}`} 
            alt={item.nombre} 
        />
        <div className="card-body">
            <h5 className="card-title ">{item.nombre} </h5>
            <div className="etiquetas">
                <span className="tags me-2"> {item.genero?.nombre ?? "Sin género"} </span>
                {item.subgenero?.nombre && (<span className="tags me-2" > {item.subgenero.nombre} </span> )}
            </div>
            {
                !esAlbum &&
                <>
                    <div className='d-flex'>
                        <p className='fw-semibold pe-1'> Album: </p>
                        <p > {item.album == null ? "Independiente": item.album} </p>
                    </div>
                    <div className='d-flex'>
                        <p className='fw-semibold pe-1'> Reproduciones: </p>
                        <p > {item.numrep} </p>
                    </div>
                </>
            }
            {
                esAlbum &&
                <>
                    <div className='d-flex'>
                        <p className='fw-semibold pe-1'> Ventas: </p>
                        <p > {item.numventas} </p>
                    </div>
                </>
            }
            <div className='d-flex puntuacionCont'>
                <div className='puntuacion'>{renderStars(item.valoracion)}</div>
                    <p >${item.precio} <i className="fa-solid fa-euro-sign"></i></p>
            </div>      
        </div>

        {/* Modal flotante */}
        {mostrarModal && (
                <div className="modalDescarga">
                    <button onClick={() => descargarArchivo(item.nombreamazon,"mp3")}>MP3</button>
                    <button onClick={() => descargarArchivo(item.nombreamazon,"flac")}>FLAC</button>
                    <button onClick={() => descargarArchivo(item.nombreamazon,"wav")}>WAV</button>
                    <button onClick={() => setMostrarModal(false)}>✖</button>
                </div>
            )}

    </div>

);}

function ElementoPer({ item }) {
    const navigate = useNavigate();

return (
    <div className="card" >
        <div className="botonesAccion d-flex justify-content-between">
            <i className="fa-solid fa-plus" onClick={() => { navigate("/masInfoPerfil", { state: item }); }}></i>
            <i className="fa-solid fa-share-nodes"></i>
        </div>
        <img 
            src={getFoto(item)}
            className={`card-img-top card-img-circle`} 
            alt={item.nombre} 
        />
        <div className="card-body">
            <h5 className="card-title "> {item.nombreusuario} </h5>
            <div className="etiquetas">
                <span className="tags me-2"> {item.genero?.nombre ?? "Sin género"} </span>
                {/* <span className="tags me-2">{item.subgenero}</span> */}
            </div>
            <div className='d-flex flex-wrap align-items-center'>
                <p className='fw-semibold pe-1'> Email: </p>
                <p className='pe-1'> {item.correo} </p>
                <i className="fa-solid fa-envelope"></i>
            </div>
            <div className='d-flex flex-wrap align-items-center'>
                <p className='fw-semibold pe-1'> Oyentes: </p>
                <p className='pe-1'> {item.oyentes} </p>
                <i className="fa-solid fa-headphones-simple"></i>
            </div>   
            <div className='d-flex puntuacionCont'>
                <div className='puntuacion'>{renderStars(item.valoracion)}</div>
            </div>  
        </div>  
    </div>
);}

export default ListaFiltro