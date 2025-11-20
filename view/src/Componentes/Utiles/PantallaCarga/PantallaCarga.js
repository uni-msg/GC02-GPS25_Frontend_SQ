import React from 'react';
import './PantallaCarga.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRecordVinyl } from '@fortawesome/free-solid-svg-icons';

const PantallaCarga = ({ mensaje = "Cargando..." }) => {
    return (
        <div className="pantalla-carga">
            <div className="contenedor-carga">
                <FontAwesomeIcon icon={faRecordVinyl} className="icono-cargando" />
                <p className="mensaje-carga">{mensaje}</p>
            </div>
        </div>
    );
};

export default PantallaCarga;
