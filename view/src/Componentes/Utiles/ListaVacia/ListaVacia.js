import React from 'react';
import './ListaVacia.css';

const ListaVacia = ({ mensaje = "No hay elementos para mostrar." }) => {
    return (
        <div id="listaVacia">
            <div>
                <div > 🗂️ </div>
                <p > {mensaje} </p>
            </div>
        </div>
    );
};

export default ListaVacia;
