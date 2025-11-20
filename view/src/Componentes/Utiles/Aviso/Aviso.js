import React, { useEffect } from 'react';
import './Aviso.css';

const Aviso = ({ mensaje, tipo = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`aviso aviso-${tipo}`}>
      {mensaje}
    </div>
  );
};

export default Aviso;
