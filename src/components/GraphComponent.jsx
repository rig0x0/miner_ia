import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const colores = {
  Au: '#82ca9d',
  Ag: '#8884d8',
  Cu: 'red',
  Pb: '#ff7300',
  Zn: '#00c49f',
  Fe: '#a83279'
};

const elementos = ['Au', 'Ag', 'Cu', 'Pb', 'Zn', 'Fe'];

export const GraphComponent = ({ tipo = 'Recuperaciones', datosFiltrados, unidadSeleccionada, onUnidadChange }) => {
  const [rangoY, setRangoY] = useState([0, 100]);

  useEffect(() => {
    if (datosFiltrados?.Fechas) {
      const valoresAGraficar = [];

      datosFiltrados.Fechas.forEach((_, index) => {
        elementos.forEach(el => {
          const valor = datosFiltrados?.[el]?.[index];
          if (valor !== undefined) {
            if (
              tipo === 'Recuperaciones' ||
              (tipo !== 'Recuperaciones' &&
                ((unidadSeleccionada === '%' && el !== 'Ag') ||
                  (unidadSeleccionada === 'g/t' && el === 'Ag')))
            ) {
              valoresAGraficar.push(valor);
            }
          }
        });
      });

      if (valoresAGraficar.length > 0 && valoresAGraficar.every(val => typeof val === 'number')) {
        const min = Math.min(...valoresAGraficar);
        const max = Math.max(...valoresAGraficar);
        const margin = (max - min) * 0.1;
        setRangoY([Math.floor(min - margin), Math.ceil(max + margin)]);
      } else {
        setRangoY([0, 100]);
      }
    } else {
      setRangoY([0, 100]);
    }
  }, [datosFiltrados, tipo, unidadSeleccionada]);

  const data = datosFiltrados?.Fechas?.map((fecha, index) => {
    const row = { name: new Date(fecha) };
    elementos.forEach(el => {
      row[el] = datosFiltrados?.[el]?.[index];
    });
    return row;
  }).filter(item =>
    item.name && elementos.some(el => item[el] !== undefined)
  );

  const yAxisLabel = tipo === 'Recuperaciones' ? 'Porcentaje' : (unidadSeleccionada === 'g/t' ? 'Valor (g/t)' : 'Porcentaje');

  return (
    <div>
      {(tipo === 'Contenidos' || tipo === 'Leyes') && (
        <div className="mt-1 d-flex justify-content-center">
          <div className="fondoBtnVista px-2 py-1 d-inline-flex" >
            <button
              className={`btn ${unidadSeleccionada === '%' ? 'botonActivoDetalles' : 'botonInactivoDetalles'} me-2`}
              onClick={() => onUnidadChange('%')}
            >
              %
            </button>
            <button
              className={`btn ${unidadSeleccionada === 'g/t' ? 'botonActivoDetalles' : 'botonInactivoDetalles'}`}
              onClick={() => onUnidadChange('g/t')}
            >
              g/t
            </button>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(date) => format(date, 'yyyy-MM-dd')} angle={-30} textAnchor="end" />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: 'left' }} domain={rangoY} />
          <Tooltip labelFormatter={(value) => format(value, 'yyyy-MM-dd HH:mm:ss')} />
          <Legend verticalAlign="top" />

          {elementos.map(el => {
            const esGpt = el === 'Ag';
            if (
              tipo === 'Recuperaciones' ||
              (tipo !== 'Recuperaciones' &&
                ((unidadSeleccionada === '%' && !esGpt) || (unidadSeleccionada === 'g/t' && esGpt)))
            ) {
              return (
                <Line
                  key={el}
                  type="monotone"
                  dataKey={el}
                  stroke={colores[el]}
                  name={el}
                  dot={{ r: 3 }}
                  strokeWidth={2}
                />
              );
            }
            return null;
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
