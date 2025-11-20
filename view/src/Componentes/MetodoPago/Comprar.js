import React, { createContext, useState } from "react";

export const CestaContext = createContext();

export const CestaProvider = ({ children }) => {
    const [productos, setProductos] = useState({ elementos: [], precioTotal: 0 });
  
    const vaciarCesta = () => {
      setProductos({ elementos: [], precioTotal: 0 });
    };

    return (
        <CestaContext.Provider value={{ productos, vaciarCesta}}>
          {children}
        </CestaContext.Provider>
      );
}