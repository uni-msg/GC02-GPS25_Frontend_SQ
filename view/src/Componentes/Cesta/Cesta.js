import React, { useContext, useState, useEffect } from 'react';
import './Cesta.css';
import Popup from '../MetodoPago/MetodoPago.js';
import PantallaCarga from "../Utiles/PantallaCarga/PantallaCarga.js";
import { VaciarCestaProvider } from '../MetodoPago/VaciarCestaContext.js';
import { deleteElementoCestaById, getCestaId,  } from "../../ApiServices/CestaService.js";
import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';

function Cesta() {

    const {idLoggedIn, token,} = useContext(UsuarioContext);

    // Manejar la cesta de forma dinámica. 
    const [productos, setProductos] = useState([]);
    const [precioTotal, setPrecioTotal] = useState(0);
    const [popUpAbierto, popUpCerrado] = useState(false);
    const [cargando, setCargando] = useState(false); //PANTALLA DE CARGA

    useEffect(() => {  fetchCesta(); }, [idLoggedIn, token]);

    const fetchCesta = async () => {
        if (idLoggedIn && token) {
            try {
                setCargando(true);
                const cestaData = await getCestaId(token, idLoggedIn);

                setProductos(cestaData.items);
                setPrecioTotal(cestaData.total);
            } catch (error) {
                console.error("Error al cargar la cesta:", error);
            } finally {
                setCargando(false);
            }
        }
    };

    const deleteElementosCesta = async () => {
        if (productos.length <= 0) return;

        await Promise.all(
            productos.map(async (item) => {
                try {
                    await deleteElementoCestaById(token,idLoggedIn, item.idelemento);
                } catch (error) {
                    console.error(`Error al obtener el producto con id ${item.idelemento}:`, error);
                }
            })
        );
    }

    //Función para abrir el popUp
    const abrirPopup = () => {
        popUpCerrado(true);
    };

    // Función para cerrar el pop-up
    const cerrarPopup = () => {
        popUpCerrado(false);
    };

    //Función para vaciar la cesta
    const vaciarCesta = async () => {
        try{
            await deleteElementosCesta();
            setProductos([]);
            setPrecioTotal(0);
        } catch (error) {   
            console.error("Error al borrar la cesta:", error);
        }
    };
    //Función para eliminar un elemento de la cesta.

    const eliminarElemento = async (elem) => {
        try {
            await deleteElementoCestaById(token, idLoggedIn, elem.idelemento);
            setPrecioTotal(precioTotal-elem.precio);
            fetchCesta();
        } catch (error) {
            console.error("Error eliminando el elemento:", error);
            alert("No se pudo eliminar el elemento de la cesta.");
        }
    };

    const [numero, setNumero] = useState("");
    const [donativo, setDonativo] = useState(0);

    // Función para manejar el cambio en el input de donativo
    const handleDonativo = (e) => {
        let valor = e.target.value.replace(/\D/g, ""); // Elimina todo lo que no sea número

        // Limita a 12 dígitos
        if (valor.length > 12) {
            valor = valor.substring(0, 12);
        }

        setNumero(valor);
        const donativoNuevo = parseFloat(valor) || 0;
        setDonativo(donativoNuevo); // Guardamos el donativo como número
    };

    const totalConDonativo = (parseFloat(precioTotal?.precio || precioTotal || 0) + parseFloat(donativo || 0));

    return (
    <div id="cesta">
      {cargando?(<PantallaCarga mensaje="Cargando cesta..." />):
      (
        <>
            <div id='tituloCesta'>
                <h1> {"Cesta de productos"} </h1>
            </div>
            <div id='datosCesta'
                style={{ display: Array.isArray(productos) && productos.flat().length === 0
                            ? 'none'  // mostrar si está vacía
                            : 'block'   // ocultar si hay productos
                }}
            >
                <ul className='ps-0'>
                    {Array.isArray(productos) && productos.map((item, index) =>
                        <li key={index} className='d-flex justify-content-between align-items-center'>
                            <p><i className={item.tipo === 1 ? "fa-solid fa-record-vinyl" : "fa-solid fa-rectangle-list"}></i>{" )"} {item.nombre}</p>
                            <p>{item.precio}&euro;
                                <i className="fa-solid fa-trash botonPapelera"
                                    onClick={() => eliminarElemento(item)}>
                                </i>
                            </p>
                        </li>)}
                    <hr></hr>
                    <div className="peticion">
                        <p>Apoya a tus artistas con un pequeño donativo</p>
                        <i className="fa-solid fa-heart corazon"></i>
                        <input type="text" value={numero} onChange={handleDonativo} inputMode="numeric" id="donativo"  name="donativo" placeholder="Donativo €" />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0 }}>Total</p>
                        <p style={{ margin: 0 }}>{totalConDonativo.toFixed(2)}€</p>
                    </div>

                </ul>
                <div id='divBotonComprar'>
                    <button className='botonComprar' onClick={abrirPopup}> COMPRAR </button>
                </div>
            </div>
            <div className="cestaVacia" id='divBotonComprar'
                style={{
                    display:
                        Array.isArray(productos) && productos.flat().length === 0
                            ? 'block'  // mostrar si está vacía
                            : 'none'   // ocultar si hay productos
                }}
            >
                <p>Parece que tu cesta está vacía.</p>
                <p>¡Descubre algo genial en nuestro catálogo! 😊</p>
            </div>

            {popUpAbierto && (
                <VaciarCestaProvider vaciarCesta={vaciarCesta}>
                    <Popup closePopup={cerrarPopup} productos={productos} precio={totalConDonativo.toFixed(2)} idUsuario={idLoggedIn} tokenUsuario={token} />
                </VaciarCestaProvider>
            )}
        </>)}
    </div>
    );
}
export default Cesta;