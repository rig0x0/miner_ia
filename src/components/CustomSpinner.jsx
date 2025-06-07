import React from 'react';
import './ComponentsStyles/Spinner.css'; // Asegúrate de que la ruta al archivo CSS sea correcta

export const CustomSpinner = ({
  visible = true,
  text = "Obteniendo datos...",
  dotColor = '#3498db', // Color de los puntos
  dotSize = '12px',     // Tamaño de cada punto
  textColor = '#555'    // Color del texto
}) => {
  if (!visible) {
    return null;
  }

  const dotStyle = {
    backgroundColor: dotColor,
    width: dotSize,
    height: dotSize,
  };

  return (
    <div className="spinner-overlay"> {/* Contenedor para centrar en toda la página */}
      <div className="spinner-content-wrapper">
        <div className="dots-loader">
          <div className="dot" style={{ ...dotStyle, animationDelay: '0s' }}></div>
          <div className="dot" style={{ ...dotStyle, animationDelay: '0.2s' }}></div>
          <div className="dot" style={{ ...dotStyle, animationDelay: '0.4s' }}></div>
        </div>
        {text && <p className="loading-text" style={{ color: textColor }}>{text}</p>}
      </div>
    </div>
  );
};
