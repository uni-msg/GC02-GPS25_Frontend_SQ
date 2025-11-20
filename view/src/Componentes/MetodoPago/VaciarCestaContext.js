import React, { createContext } from 'react';

export const VaciarCestaContext = createContext({
  vaciarCesta: () => {},
});

export const VaciarCestaProvider = ({ vaciarCesta, children }) => {
    return (
      <VaciarCestaContext.Provider value={{ vaciarCesta }}>
        {children}
      </VaciarCestaContext.Provider>
    );
};