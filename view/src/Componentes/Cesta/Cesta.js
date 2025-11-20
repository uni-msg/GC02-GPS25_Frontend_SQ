import React, { useContext, useState, useEffect } from 'react';
import datos from '../../Datos/cesta.json';
import './Cesta.css';
import Popup from '../MetodoPago/MetodoPago.js';
import { VaciarCestaProvider } from '../MetodoPago/VaciarCestaContext.js';
import { getCesta, deleteElementosCesta, deleteElementoCestaById, getCestaId, getPrecioCesta } from "../../ApiServices/CestaService.js";
import { UsuarioContext } from '../InicioSesion/UsuarioContext.js';
import { getElementoById } from '../../ApiServices/ElementosService.js';


function Cesta() {

    const {
        idLoggedIn,
        token,
    } = useContext(UsuarioContext);

    // Manejar la cesta de forma dinámica. 
    const [productos, setProductos] = useState([]);
    const [precioTotal, setPrecioTotal] = useState(0);
    const [popUpAbierto, popUpCerrado] = useState(false);

    useEffect(() => {
        const fetchCesta = async () => {
            //console.log("idcesta", idLoggedIn)
            if (idLoggedIn && token) {
                try {
                    const cestaData = await getCestaId(token, idLoggedIn);
                    const total = await getPrecioCesta(token, idLoggedIn);


                    // Obtener todos los productos a partir de los idElemento
                    const productosData = await Promise.all(
                        cestaData.map(async (item) => {
                            try {

                                const producto = await getElementoById(token, item.idelemento);
                                return producto;
                            } catch (error) {
                                console.error(`Error al obtener el producto con id ${item.idelemento}:`, error);
                                return null; // Devuelve null si falla un producto
                            }
                        })
                    );

                    // Filtrar productos nulos (errores en la petición)
                    const productosFiltrados = productosData.filter(p => p !== null);

                    setProductos(productosFiltrados.flat());
                    setPrecioTotal(total);

                } catch (error) {
                    console.error("Error al cargar la cesta:", error);
                }
            }
        };

        fetchCesta();
    }, [idLoggedIn, token]);


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
        //setProductos([]);
        setPrecioTotal(0);
        try{
            await deleteElementosCesta(token, idLoggedIn);
        } catch (error) {   
            console.error("Error al borrar la cesta:", error);
        }
    };
    //Función para eliminar un elemento de la cesta.

    const eliminarElemento = async (idElemento) => {
        try {

            // 1. Eliminar en el backend
            await deleteElementoCestaById(token, idLoggedIn, idElemento);

            // 2. Actualizar productos
            const productosActualizados = productos.filter((producto) => producto.id !== idElemento);
            setProductos(productosActualizados);

            // 3. Obtener nuevo total desde backend
            const nuevoTotal = await getPrecioCesta(token, idLoggedIn);
            setPrecioTotal(nuevoTotal);
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
            <div id='tituloCesta'>
                <h1> {"Cesta de productos"} </h1>
            </div>
            <div id='datosCesta'
                style={{
                    display:
                        Array.isArray(productos) &&
                            productos.flat().length === 0
                            ? 'none'  // mostrar si está vacía
                            : 'block'   // ocultar si hay productos
                }}
            >
                <ul className='ps-0'>
                    {Array.isArray(productos) && productos.map((item, index) =>
                        <li key={index} className='d-flex justify-content-between align-items-center'>
                            <p>{item.nombre}</p>
                            <p>{item.precio}&euro;
                                <i className="fa-solid fa-trash botonPapelera"
                                    onClick={() => eliminarElemento(item.id)}>
                                </i>
                            </p>
                        </li>)}
                    <hr></hr>
                    <div className="peticion">
                        <p>Apoya a tus artistas con un pequeño donativo</p>
                        <i className="fa-solid fa-heart corazon"></i>
                        <input
                            type="text"
                            value={numero}
                            onChange={handleDonativo}
                            inputMode="numeric"
                            id="donativo"
                            name="donativo"
                            placeholder="Donativo €"
                        />
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
                        Array.isArray(productos) &&
                            productos.flat().length === 0
                            ? 'block'  // mostrar si está vacía
                            : 'none'   // ocultar si hay productos
                }}
            >
                <p>Parece que tu cesta está vacía.</p>
                <p>¡Descubre algo genial en nuestro catálogo! 😊</p>
            </div>

            {popUpAbierto && (
                <VaciarCestaProvider vaciarCesta={vaciarCesta}>
                    <Popup closePopup={cerrarPopup} 
                    productos={productos} 
                    precio={totalConDonativo.toFixed(2)} 
                    idUsuario={idLoggedIn}
                    tokenUsuario={token}
                    />
                </VaciarCestaProvider>
            )}
        </div>

    );
}
export default Cesta;