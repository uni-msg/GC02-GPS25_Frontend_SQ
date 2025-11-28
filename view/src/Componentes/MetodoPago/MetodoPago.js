import './MetodoPago.css';
import React, { useState, useContext } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import GooglePayButton from "@google-pay/button-react";
import visaMastercard from "../../Recursos/visa-mastercard.png";
import paypalLogo from "../../Recursos/paypal.png";
import payLogo from "../../Recursos/Google_Pay_Logo.png";
import bizumLogo from "../../Recursos/Logo-Bizum.png"
import { VaciarCestaContext,  } from './VaciarCestaContext.js';
import { postTiene } from '../../ApiServices/CestaService.js';

function Popup({ closePopup, productos, precio, idUsuario, tokenUsuario }) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const { vaciarCesta } = useContext(VaciarCestaContext);
  const handleBackClick = () => {
    setMetodoSeleccionado(null); // Restablece el método de pago seleccionado
  };

  const handlePagar = async () => {

    const numTelefonoElem = document.getElementById('numtelefono');
    const numTelefono = numTelefonoElem ? numTelefonoElem.value : null;

    const numTarjetaElem = document.getElementById('numTarjeta');
    const numTarjeta = numTarjetaElem ? numTarjetaElem.value : null;
   
    const fcaducidadElem = document.getElementById('fcaducidad');
    const fcaducidad = fcaducidadElem ? fcaducidadElem.value : null;

    const numCodigoElem = document.getElementById('codSeguridad');
    const numCodigo = numCodigoElem ? numCodigoElem.value : null;
    if (metodoSeleccionado === 'visa'){
      if (!numTarjeta || !numCodigo || !fcaducidad){
        return;
      }
      else{
        try{
          await postTiene(tokenUsuario, idUsuario);
          vaciarCesta();  // Vacía la cesta desde el contexto
          alert("Pago realizado con éxito")
        } catch(error) {
          console.error("Error al agregar el producto:", error);
        }
        closePopup();
      }
    }

    else if (metodoSeleccionado === 'bizum'){
      if (!numTelefono) {
        return;
      }
      else{
        try{
          await postTiene(tokenUsuario, idUsuario);
          vaciarCesta();  // Vacía la cesta desde el contexto
          alert("Pago realizado con éxito")
        } catch(error) {
          console.error("Error al agregar el producto:", error);
        }
        closePopup();
      }
    }
    
    else {
      vaciarCesta();  // Vacía la cesta desde el contexto
      alert("Pago realizado con éxito")
      closePopup();
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div style={{ display: metodoSeleccionado ? "none" : "block" }}>
          <i style={{ marginLeft: 'auto' }} className="fa-solid fa-circle-xmark botonCerrar" onClick={closePopup}></i>
          <h2 >Elige tu método de pago </h2>


          <div className="Metodos">
            {/* Botones para los diferentes métodos de pago */}

            <button onClick={() => setMetodoSeleccionado("visa")}>Visa</button>
            <button onClick={() => setMetodoSeleccionado("paypal")}>PayPal</button>
            <button onClick={() => setMetodoSeleccionado("googlepay")}>Google Pay</button>
            <button onClick={() => setMetodoSeleccionado("bizum")}>Bizum</button>
          </div>

        </div>
        {/*====== Desarrollo de los diferentes métodos de Pago ======*/}

        {/*Pago con Visa*/}
        <div className='pagoVisa'>
          {metodoSeleccionado === "visa" && (

            <form id="formVisa" onSubmit={(e) => e.preventDefault()} >
              <div className="botonesSuperiroes">
                <i className="fa-solid fa-circle-chevron-left botonAtras" onClick={handleBackClick}></i>
                <img id='logoVisa' src={visaMastercard} alt="logo de visa y mastercard"></img>
                <i className="fa-solid fa-circle-xmark botonCerrar" onClick={closePopup}></i>
              </div>
              <h2>Pago con tarjeta</h2>

              <label for="numTarjeta">Número de tarjeta</label>
              <input required maxLength="16" type="text" id="numTarjeta" name="numTarjeta" placeholder="Nº de Tarjeta" 
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Elimina cualquier carácter no numérico
                if (e.target.value.length > 16) {
                  e.target.value = e.target.value.slice(0, 16); // Limita la longitud a 16 caracteres
                }
              }}></input>

              <div id='fila-doble'>
                <div>
                  <label for="fcaducidad">Caducidad (MM/YY)</label>
                  <input required type="month" id="fcaducidad" name="fcaducidad" placeholder="MM/YY"></input>
                </div>
                <div>
                  <label for="codSeguridad">Código CVV</label>
                  <input required maxLength="4" type="textr" id="codSeguridad" name="codSeguridad" placeholder="CVV"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Elimina cualquier carácter no numérico
                    if (e.target.value.length > 16) {
                      e.target.value = e.target.value.slice(0, 16); // Limita la longitud a 16 caracteres
                    }
                  }}></input>
                </div>
              </div>
              <input className="botonPagar" type="submit" value="Continuar con el Pago" onClick={handlePagar}></input>
            </form>

          )}
        </div>

        {/*Pago con PayPal*/}
        <div className='pagoPaypal'>
          {metodoSeleccionado === "paypal" && (

            <PayPalScriptProvider options={{ "client-id": "Aeh6LonYqRlqMXWCEApyMtTW7O81KlLT-HkiAyN27bLNJwi4mU1H3vpsOVZLRz_pTr3P4SKcom71s1T2" }}>
              <div className="botonesSuperiroes">
                <i className="fa-solid fa-circle-chevron-left botonAtras" onClick={handleBackClick}></i>
                <img id='logoPaypal' src={paypalLogo} alt="logo de PayPal"></img>
                <i className="fa-solid fa-circle-xmark botonCerrar" onClick={closePopup}></i>
              </div>
              <h2>Pago con PayPal</h2>

              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: precio,
                        },
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order.capture().then(() => {
                    handlePagar(); // vaciar la cesta después del pago
                  });
                }}
              />
            </PayPalScriptProvider>
          )}
        </div>

        {/*Pago con GooglePay*/}
        <div className='pagoGooglepay'>
          {metodoSeleccionado === 'googlepay' && (
            <>
              {/* Botones superiores */}
              <div className="botonesSuperiroes">
                <i className="fa-solid fa-circle-chevron-left botonAtras" onClick={handleBackClick}></i>
                <img id='logoGpay' src={payLogo} alt="logo de Google Pay"></img>
                <i className="fa-solid fa-circle-xmark botonCerrar" onClick={closePopup}></i>
              </div>
              <h2>Pago con GooglePay</h2>
              <GooglePayButton
                environment="TEST"
                paymentRequest={{
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [
                    {
                      type: "CARD",
                      parameters: {
                        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                        allowedCardNetworks: ["MASTERCARD", "VISA"],
                      },
                      tokenizationSpecification: {
                        type: "PAYMENT_GATEWAY",
                        parameters: {
                          gateway: "example", // Aquí debes configurar un gateway real como Stripe, Adyen, etc.
                          gatewayMerchantId: "exampleMerchantId",
                        },
                      },
                    },
                  ],
                  merchantInfo: {
                    merchantId: "12345678901234567890", // ID del comercio 
                    merchantName: "UnderSound",
                  },
                  transactionInfo: {
                    totalPriceStatus: "FINAL",
                    totalPriceLabel: "Total",
                    totalPrice: precio?.toString() || "1.00",
                    currencyCode: "EUR",
                    countryCode: "ES",
                  },
                }}
                onLoadPaymentData={(paymentRequest) => {
                  handlePagar(paymentRequest);
                  alert("Pago realizado con éxito");
                  closePopup();
                }}
              />
            </>
          )}

        </div>
        {/*Pago con Bizum*/}
        <div>
          {metodoSeleccionado === 'bizum' && (
            <form id="formBizum" onSubmit={(e) => e.preventDefault()}>
              <div className="botonesSuperiroes">
                <i className="fa-solid fa-circle-chevron-left botonAtras" onClick={handleBackClick}></i>
                <img id='bizumLogo' src={bizumLogo} alt="logo de bizum"></img>
                <i className="fa-solid fa-circle-xmark botonCerrar" onClick={closePopup}></i>
              </div>
              <div className="cuadroBizum">
                <label for="numTelefono">Teléfono registrado en Bizum</label>
                <div className="etiquetaBizum">
                  <i id='iconoMovil' className="fa-solid fa-mobile-screen-button "></i>
                  <input required maxLength="9" type="text" id="numtelefono" name="numTelefono" placeholder="Introduce tu teléfono"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Elimina cualquier carácter no numérico
                    if (e.target.value.length > 16) {
                      e.target.value = e.target.value.slice(0, 16); // Limita la longitud a 16 caracteres
                    }
                  }}
                  ></input>
                </div>
                <p>No olvides tener tu móvil a mano</p>
                <input className="botonPagar" type="submit" value="Continuar con el Pago" onClick={handlePagar}></input>
                <p id='detallePrecio'>Detalle del pago: {precio}&euro; </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Popup;  