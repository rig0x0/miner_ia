// GraphComponent.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook

// Paleta de colores mejorada (puedes ajustarla o mantener la tuya)
const ELEMENT_COLORS = {
    Au: '#FFC300', // Oro más vibrante
    Ag: '#A8A8A8', // Plata
    Cu: '#E67E22', // Cobre
    Pb: '#5D6D7E', // Plomo
    Zn: '#85929E', // Zinc
    Fe: '#C0392B', // Hierro
    default: '#3498DB' // Azul para default
};



const getUnitForElement = (tipo, elemento) => {
    if (tipo === 'Recuperaciones') return '%';
    if (tipo === 'Contenidos') {
        if (['Au', 'Ag'].includes(elemento)) return 'kg';
        if (['Cu', 'Pb', 'Zn', 'Fe'].includes(elemento)) return 't';
    }
    if (tipo === 'Leyes') {
        if (['Au', 'Ag'].includes(elemento)) return 'g/t';
        if (['Cu', 'Pb', 'Zn', 'Fe'].includes(elemento)) return '%';
    }
    return '';
};

export const GraphComponent = ({ 
    graphTitle,
    tipo, 
    datosFiltrados, 
    unidadSeleccionada, 
    onUnidadChange 
}) => {
    const { t, i18n } = useTranslation();
    console.log(datosFiltrados)
    const [dynamicYDomain, setDynamicYDomain] = useState(['auto', 'auto']);

    // Nombres descriptivos para los elementos (opcional, para leyendas/tooltips)
const ELEMENT_NAMES = {
    Au: t("tablero.cardGrafico.grafica.elemento.oro"), Ag: t("tablero.cardGrafico.grafica.elemento.plata"), Cu: t("tablero.cardGrafico.grafica.elemento.cobre"),
    Pb: t("tablero.cardGrafico.grafica.elemento.plomo"), Zn: t("tablero.cardGrafico.grafica.elemento.zinc"), Fe: t("tablero.cardGrafico.grafica.elemento.hierro"),
};

    

    const elementosEnDatos = useMemo(() => {
        return Object.keys(datosFiltrados || {}).filter(key => key !== 'Fechas');
    }, [datosFiltrados]);

    useEffect(() => {
        if (datosFiltrados && datosFiltrados.Fechas && datosFiltrados.Fechas.length > 0 && elementosEnDatos.length > 0) {
            let allValues = [];
            elementosEnDatos.forEach(el => {
                let considerarValorParaDominioY = false;
                if (tipo === 'Recuperaciones') {
                    considerarValorParaDominioY = true;
                } else if (tipo === 'Contenidos') {
                    considerarValorParaDominioY = true;
                } else if (tipo === 'Leyes') {
                    const esMetalPrecioso = ['Au', 'Ag'].includes(el);
                    if (unidadSeleccionada === 'g/t' && esMetalPrecioso) {
                        considerarValorParaDominioY = true;
                    } else if (unidadSeleccionada === '%' && !esMetalPrecioso && ['Cu', 'Pb', 'Zn', 'Fe'].includes(el)) {
                        considerarValorParaDominioY = true;
                    }
                }
                if (considerarValorParaDominioY && Array.isArray(datosFiltrados[el])) {
                    allValues.push(...datosFiltrados[el].filter(val => typeof val === 'number' && !isNaN(val)));
                }
            });

            if (allValues.length > 0) {
                const minVal = Math.min(...allValues);
                const maxVal = Math.max(...allValues);
                const padingRatio = allValues.every(v => v === 0) ? 0 : 0.1; // No añadir padding si todos son 0
                const margin = (maxVal - minVal) * padingRatio || (maxVal === 0 ? 10 : 5); // Margen para evitar dominio 0 si maxVal=minVal
                
                let domainMin = Math.floor(minVal - margin);
                let domainMax = Math.ceil(maxVal + margin);

                if (minVal >= 0 && domainMin < 0) domainMin = 0; // Evitar mínimo negativo si todos los datos son >=0

                // Caso especial: si todos los valores son 0, el dominio podría ser [-5, 5] o [0,10]
                if (minVal === 0 && maxVal === 0) {
                    domainMin = 0;
                    domainMax = 10; // O un valor por defecto apropiado
                }
                 // Asegurar que el dominio no sea NaN y tenga un rango mínimo
                if (!Number.isFinite(domainMin)) domainMin = 0;
                if (!Number.isFinite(domainMax)) domainMax = 100;
                if (domainMin === domainMax) domainMax = domainMin + 10; // Asegurar un rango visible

                setDynamicYDomain([domainMin, domainMax]);
            } else {
                setDynamicYDomain([0, 100]);
            }
        } else {
            setDynamicYDomain([0, 100]);
        }
    }, [datosFiltrados, tipo, unidadSeleccionada, elementosEnDatos]);

    const title = graphTitle || t("tablero.cardGrafico.grafica.titulo");

    const chartData = useMemo(() => {
        if (!datosFiltrados || !datosFiltrados.Fechas || datosFiltrados.Fechas.length === 0) {
            return [];
        }
        return datosFiltrados.Fechas.map((fecha, index) => {
            const dataPoint = { name: fecha };
            elementosEnDatos.forEach(el => {
                if (datosFiltrados[el] && typeof datosFiltrados[el][index] !== 'undefined') {
                    dataPoint[el] = datosFiltrados[el][index];
                } else {
                    dataPoint[el] = null; // Asegurar que el elemento exista en el punto de datos para connectNulls
                }
            });
            return dataPoint;
        });
    }, [datosFiltrados, elementosEnDatos]);

    let yAxisLabelText = tipo;
    let yAxisTickUnit = '';

    if (tipo === 'Recuperaciones') {
        yAxisLabelText = t("tablero.cardGrafico.grafica.tituloEjeYrecuperacion");
        yAxisTickUnit = '%'; // Para añadir a los ticks del eje Y
    } else if (tipo === 'Contenidos') {
        yAxisLabelText = t("tablero.cardGrafico.grafica.tituloEjeYcontenido");
    } else if (tipo === 'Leyes') {
        if (unidadSeleccionada === 'g/t') {
            yAxisLabelText = `${t("tablero.cardGrafico.grafica.tituloEjeYley")} (Au, Ag)`;
            yAxisTickUnit = 'g/t';
        } else {
            yAxisLabelText = `${t("tablero.cardGrafico.grafica.tituloEjeYley")} (Otros)`;
            yAxisTickUnit = '%';
        }
    }
    // Añadimos la unidad principal al título del eje Y si es consistente para el grupo mostrado
    if (yAxisTickUnit) {
        yAxisLabelText += ` (${yAxisTickUnit})`;
    }


    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ddd',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>{label}</p>
                    {payload.map((pld) => (
                        <div key={pld.dataKey} style={{ marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                            <span style={{
                                display: 'inline-block',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: pld.color,
                                marginRight: '8px'
                            }}></span>
                            <span style={{ color: pld.color, fontWeight: '500' }}>
                                {ELEMENT_NAMES[pld.name] || pld.name}:
                            </span>
                            <span style={{ marginLeft: 'auto', paddingLeft: '10px', color: '#555' }}>
                                {typeof pld.value === 'number' ? pld.value.toFixed(2) : 'N/A'} {getUnitForElement(tipo, pld.name)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderLegendText = (value, entry) => {
        const { color } = entry;
        const unit = getUnitForElement(tipo, value);
        const displayName = ELEMENT_NAMES[value] || value;
        return (
            <span style={{ color, fontWeight: 500 }}>
                {displayName} <span style={{ color: '#777', fontSize: '0.9em' }}>({unit})</span>
            </span>
        );
    };
    
    const yAxisTickFormatter = (tick) => {
        if (!yAxisTickUnit) return tick.toLocaleString(); // Formato numérico general si no hay unidad específica del eje
        // Para Leyes, si es g/t o %, la unidad ya está en yAxisTickUnit
        // Para Recuperaciones, yAxisTickUnit es '%'
        // Para Contenidos, no hay yAxisTickUnit (kg y t varían por elemento)
        return `${tick.toLocaleString()}${yAxisTickUnit}`;
    };


    if (chartData.length === 0) {
        return (
            <div style={{
                border: '1px dashed #ccc', borderRadius: '8px', padding: '30px', margin: '15px',
                textAlign: 'center', backgroundColor: '#f9f9f9'
            }}>
                <h5 style={{ color: '#555', marginBottom: '15px' }}>{title}</h5>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#bbb" className="bi bi-graph-up-arrow" viewBox="0 0 16 16" style={{marginBottom: '10px'}}>
                    <path fillRule="evenodd" d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5"/>
                </svg>
                <p style={{ color: '#777', fontSize: '1.1em' }}>No hay datos disponibles para mostrar.</p>
                <small style={{ color: '#999' }}>Intenta ajustar los filtros o verifica la fuente de datos.</small>
            </div>
        );
    }

    return (
        <div style={{ 
            border: '1px solid #e0e0e0', borderRadius: '8px', 
            padding: '25px', backgroundColor: '#fff', 
        }}>
            <h4 style={{ textAlign: 'center', color: '#333', marginBottom: '15px', fontWeight: '600' }}>
                {title}
            </h4>

            {tipo === 'Leyes' && (
                <div className="mt-1 mb-4 d-flex justify-content-center">
                    <ButtonGroup size="sm">
                        <Button
                            variant={unidadSeleccionada === '%' ? 'secondary' : 'outline-secondary'}
                            onClick={() => onUnidadChange('%')}
                        >
                            {ELEMENT_NAMES['Cu'] || 'Otros'} (%)
                        </Button>
                        <Button
                            variant={unidadSeleccionada === 'g/t' ? 'secondary' : 'outline-secondary'}
                            onClick={() => onUnidadChange('g/t')}
                        >
                            {ELEMENT_NAMES['Au'] || 'Au'}, {ELEMENT_NAMES['Ag'] || 'Ag'} (g/t)
                        </Button>
                    </ButtonGroup>
                </div>
            )}

            <ResponsiveContainer width="100%" height={600}>
                <LineChart data={chartData} margin={{ top: 10, right: 35, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e9" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#555' }} 
                        angle={-40}
                        textAnchor="end"
                        height={70}
                        interval="preserveStartEnd"
                        axisLine={{ stroke: '#ccc' }}
                        tickLine={{ stroke: '#ddd' }}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: '#555' }} 
                        domain={dynamicYDomain}
                        label={{ 
                            value: yAxisLabelText, 
                            angle: -90, 
                            position: 'insideLeft', 
                            style: { fontSize: 14, fill: '#444', fontWeight: '500' }, 
                            dx: -10 // Ajusta para que no se solape con los números
                        }}
                        width={85}
                        axisLine={{ stroke: '#ccc' }}
                        tickLine={{ stroke: '#ddd' }}
                        tickFormatter={yAxisTickFormatter}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#aaa', strokeDasharray: '3 3' }} />
                    <Legend 
                        verticalAlign="bottom" 
                        iconSize={12} 
                        wrapperStyle={{fontSize: "13px", paddingTop: '20px', paddingBottom: '0px', color: '#333'}}
                        formatter={renderLegendText}
                    />

                    {elementosEnDatos.map(el => {
                        let mostrarLinea = false;
                        if (tipo === 'Recuperaciones') {
                            mostrarLinea = true;
                        } else if (tipo === 'Contenidos') {
                            mostrarLinea = true;
                        } else if (tipo === 'Leyes') {
                            const esMetalPrecioso = ['Au', 'Ag'].includes(el);
                            if (unidadSeleccionada === 'g/t' && esMetalPrecioso) {
                                mostrarLinea = true;
                            } else if (unidadSeleccionada === '%' && !esMetalPrecioso && ['Cu', 'Pb', 'Zn', 'Fe'].includes(el)) {
                                mostrarLinea = true;
                            }
                        }
                        
                        if (!mostrarLinea) return null;

                        return (
                            <Line
                                key={el}
                                type="monotone"
                                dataKey={el}
                                stroke={ELEMENT_COLORS[el] || ELEMENT_COLORS.default}
                                name={el}
                                dot={{ r: 3, strokeWidth: 1, fill: ELEMENT_COLORS[el] || ELEMENT_COLORS.default }}
                                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', fill: ELEMENT_COLORS[el] || ELEMENT_COLORS.default}}
                                strokeWidth={2.5}
                                connectNulls={true}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};