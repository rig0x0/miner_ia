import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, ButtonGroup, Tab, Tabs } from 'react-bootstrap';
import { format } from 'date-fns';
import clienteAxios from '../../config/axios';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { es } from 'date-fns/locale';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const elementosMap = {
    1: "Au (g/t)",
    2: "Ag (g/t)",
    3: "Pb (%)",
    4: "Zn (%)",
    5: "Fe (%)",
    6: "Cu (%)",
};

export const DetailsEnsaye = () => {
    const { id } = useParams();
    const [vista, setVista] = useState("tabla");
    const [activeElementoTab, setActiveElementoTab] = useState("1");

    const getElements = async (id) => {
        const { data } = await clienteAxios.get(`/ensaye/${id}`);
        return data;
    };

    const { data: detallesEnsaye, error, isLoading } = useQuery({
        queryKey: ['ensaye', id],
        queryFn: () => getElements(id),
        enabled: !!id,
    });

    if (isLoading) return <p>Cargando...</p>;
    if (error) return <p>Error al cargar el ensaye</p>;

    const fechaFormateada = format(new Date(detallesEnsaye.fecha), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

    const prepararDatosGrafico = (elementoId) => {
        return detallesEnsaye.circuitos.map((circuito) => {
            const elemento = circuito.elementos.find(e => e.elemento.id === elementoId);
            return {
                etapa: circuito.etapa,
                valor: elemento?.existencia_teorica || 0,
            };
        });
    };

    return (
        <div className="container mt-4">

            <nav class="mb-3" aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><a href="/dashboard">Tablero</a></li>
                </ol>
            </nav>

            <h2>Detalles del Ensaye</h2>
            <Badge bg="success" className="my-2 fs-8">{detallesEnsaye.tipo_ensaye}</Badge>
            <div >
                <p className=""><i className='fas fa-calendar me-2 '></i>{fechaFormateada}</p>
            </div>
            
            

            <div className="row mb-3">
                <div className="col-md-4">
                    <Card className='p-3'>
                        <Card.Body>
                            <Card.Title>Turno</Card.Title>
                            <Card.Text className="fs-6"><i className="fas fa-clock me-2" />{detallesEnsaye.turno}</Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className='p-3'>
                        <Card.Body>
                            <Card.Title>Molienda Húmeda</Card.Title>
                            <Card.Text className="fs-6">
                                <i className="	fas fa-glass-whiskey me-2" />{detallesEnsaye.producto.molienda_humeda.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className='p-3'>
                        <Card.Body>
                            <Card.Title>Humedad</Card.Title>
                            <Card.Text className="fs-6"><i className='fas fa-tint me-2'></i>{detallesEnsaye.producto.humedad}%</Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="mb-4 p-3">
                <Card.Body>
                    <Card.Title>Cabeza General</Card.Title>
                    <Card.Text className="fs-6">
                        <i className="fas fa-mountain me-2" />{detallesEnsaye.producto.cabeza_general.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </Card.Text>
                </Card.Body>
            </Card>

            <Card className="p-4">
                <div className="justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="mb-1 fs-5">Datos por Circuito</h5>
                        <small className="fs-8">Detalle de elementos por cada etapa del circuito</small>
                    </div>
                    <div className="d-flex justify-content-center mt-3 fondoBtnVista" >
                        <ButtonGroup className='p-2 w-100 justify-content-center'>
                            <button
                                className={`btn fw-semibold rounded-pill  mx-1 
                                    ${vista === "tabla" ? "botonActivoDetalles" : "botonInactivoDetalles"}`}
                                onClick={() => setVista("tabla")}
                            >
                                Vista de Tabla
                            </button>
                            <button
                                className={`btn fw-semibold rounded-pill  mx-1 
                                    ${vista === "graficos" ? "botonActivoDetalles" : "botonInactivoDetalles"}`}
                                onClick={() => setVista("graficos")}
                            >
                                Vista de Gráficos
                            </button>
                        </ButtonGroup>
                    </div>
                </div>

                {vista === "tabla" && (
                    <Table striped hover responsive>
                        <thead>
                            <tr>
                                <th style={{ width: '20%' }}>Etapa</th>
                                {Object.values(elementosMap).map((nombre, idx) => (
                                    <th key={idx} className="text-end" style={{ width: `${80 / 6}%` }}>
                                        {nombre}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {detallesEnsaye.circuitos.map((circuito, idx) => (
                                <tr key={idx}>
                                    <td>{circuito.etapa}</td>
                                    {[1, 2, 3, 4, 5, 6].map((elementoId) => {
                                        const elemento = circuito.elementos.find(e => e.elemento.id === elementoId);
                                        const valor = elemento?.existencia_teorica || 0;
                                        return (
                                            <td key={elementoId} className="text-end">
                                                {valor.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {vista === "graficos" && (
                    <div>
                        <div className="d-flex flex-wrap gap-2 mb-3 fondoBtnVista justify-content-center" >
                            <div className="d-flex flex-wrap gap-2 justify-content-center p-1 w-100">
                                {Object.entries(elementosMap).map(([id, nombre]) => (
                                    <button
                                        key={id}
                                        className={`btn fw-semibold rounded-pill  flex-grow-1 text-nowrap 
        ${activeElementoTab === id ? 'botonActivoDetalles' : 'botonInactivoDetalles'}`}
                                        onClick={() => setActiveElementoTab(id)}
                                    >
                                        {nombre}
                                    </button>
                                ))}
                            </div>

                        </div>

                        <Card className='p-3'>
                            <Card.Body className='p-0'>
                                <Card.Title>{elementosMap[activeElementoTab]} por Etapa</Card.Title>
                                <div style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={prepararDatosGrafico(parseInt(activeElementoTab))}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="etapa"
                                                angle={-45}
                                                textAnchor="end"
                                                height={70}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis />
                                            <Tooltip formatter={(value) => value.toFixed(3)} />
                                            <Legend />
                                            <Bar
                                                dataKey="valor"
                                                name={elementosMap[activeElementoTab]}
                                                fill="#10b981"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                )}
            </Card>
        </div>
    );
};