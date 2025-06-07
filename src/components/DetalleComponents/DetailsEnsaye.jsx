import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, ButtonGroup, Tab, Tabs } from 'react-bootstrap';
import { format } from 'date-fns';
import clienteAxios from '../../config/axios';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
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
import { CustomSpinner } from '../CustomSpinner';

const elementosMapEnsayes = {
    1: "Au (g/t)",
    2: "Ag (g/t)",
    3: "Pb (%)",
    4: "Zn (%)",
    5: "Fe (%)",
    6: "Cu (%)",
};

const elementosMapContenidos = {
    1: "Au (kg)",
    2: "Ag (kg)",
    3: "Pb (ton)",
    4: "Zn (ton)",
    5: "Fe (ton)",
    6: "Cu (ton)",
};

const elementosMapDistribucion = {
    1: "Au (%)",
    2: "Ag (%)",
    3: "Pb (%)",
    4: "Zn (%)",
    5: "Fe (%)",
    6: "Cu (%)",
};

export const DetailsEnsaye = () => {
    const { id } = useParams();
    const [vistaEnsayes, setVistaEnsayes] = useState("tabla");
    const [vistaContenidos, setVistaContenidos] = useState("tabla");
    const [vistaDistribucion, setVistaDistribucion] = useState("tabla");
    const [activeElementoTab, setActiveElementoTab] = useState("1");

    const getElements = async (id) => {
        const { data } = await clienteAxios.get(`/ensaye/${id}`);
        console.log(data)
        return data;
    };

    const { data: detallesEnsaye, error, isLoading } = useQuery({
        queryKey: ['ensaye', id],
        queryFn: () => getElements(id),
        enabled: !!id,
    });

    if (isLoading) return <CustomSpinner />;
    if (error) return <p>Error al cargar el ensaye</p>;

    const fechaFormateada = format(new Date(detallesEnsaye.fecha), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

    const prepararDatosGraficoEnsayes = (elementoId) => {
        return detallesEnsaye.circuitos.map((circuito) => {
            const elemento = circuito.elementos.find(e => e.elemento.id === elementoId);
            return {
                etapa: circuito.etapa,
                valor: elemento?.ley_corregida || 0,
            };
        });
    };

    const prepararDatosGraficoContenidos = (elementoId) => {
        return detallesEnsaye.circuitos.map((circuito) => {
            const elemento = circuito.elementos.find(e => e.elemento.id === elementoId);
            return {
                etapa: circuito.etapa,
                valor: elemento?.contenido || 0,
            };
        });
    };

    const prepararDatosGraficoDistribucion = (elementoId) => {
        return detallesEnsaye.circuitos.map((circuito) => {
            const elemento = circuito.elementos.find(e => e.elemento.id === elementoId);
            return {
                etapa: circuito.etapa,
                valor: elemento?.distribucion || 0,
            };
        });
    };

    return (
        <div className="container py-4">

            <nav className="mb-3" aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><a href="/dashboard">Volver</a></li>
                </ol>
            </nav>

            <h1 className="h3 fw-bold">Detalles del Ensaye</h1>
            <p className="text-muted">Selecciona un elemento para ver las proyecciones basadas en IA</p>

            <Badge bg="success" className="mt-0">{detallesEnsaye.tipo_ensaye}</Badge>
            <p className="text-muted"><i className="fas fa-calendar me-2" />{fechaFormateada}</p>
            <p>Ensayista: {detallesEnsaye.user.name}</p>
            
            <div className="row row-cols-1 row-cols-md-3 g-3 mb-3">
                <div className="col">
                    <div className="card p-3 shadow-sm">
                        <div className="fw-bold">Turno</div>
                        <div className="h4"><i className="fas fa-clock me-2" />{detallesEnsaye.turno}</div>
                        {/* <small className="text-muted">{current.name}</small> */}
                    </div>
                    {/* <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="fw-semibold text-primary">Turno</Card.Title>
                            <Card.Text className="fs-6"><i className="fas fa-clock me-2" />{detallesEnsaye.turno}</Card.Text>
                        </Card.Body>
                    </Card> */}
                </div>
                <div className="col">
                    <div className="card p-3 shadow-sm">
                        <div className="fw-bold">Molienda Húmeda</div>
                        <div className="h4"><i className="fas fa-glass-whiskey me-2" />
                            {detallesEnsaye.producto.molienda_humeda.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div>
                        {/* <small className="text-muted">{current.name}</small> */}
                    </div>
                    {/* <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="fw-semibold text-primary">Molienda Húmeda</Card.Title>
                            <Card.Text className="fs-6">
                                <i className="fas fa-glass-whiskey me-2" />
                                {detallesEnsaye.producto.molienda_humeda.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </Card.Text>
                        </Card.Body>
                    </Card> */}
                </div>
                <div className="col">
                    <div className="card p-3 shadow-sm">
                        <div className="fw-bold">Humedad</div>
                        <div className="h4">
                            <i className="fas fa-tint me-2" />
                            {detallesEnsaye.producto.humedad}%
                        </div>
                        {/* <small className="text-muted">{current.name}</small> */}
                    </div>
                    {/* <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="fw-semibold text-primary">Humedad</Card.Title>
                            <Card.Text className="fs-6">
                                <i className="fas fa-tint me-2" />
                                {detallesEnsaye.producto.humedad}%
                            </Card.Text>
                        </Card.Body>
                    </Card> */}
                </div>
            </div>

            <div className="card p-3 shadow-sm mb-3">
                <div className="fw-bold">Cabeza General</div>
                <div className="h4">
                    <i className="fas fa-mountain me-2" />
                    {detallesEnsaye.producto.cabeza_general.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </div>
                {/* <small className="text-muted">{current.name}</small> */}
            </div>
            {/* <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Card.Title className="fw-semibold text-primary">Cabeza General</Card.Title>
                    <Card.Text className="fs-6">
                        <i className="fas fa-mountain me-2" />
                        {detallesEnsaye.producto.cabeza_general.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </Card.Text>
                </Card.Body>
            </Card> */}

            <Card className="shadow-sm p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                    <div className="mb-2 mb-md-0">
                        <h5 className="fw-bold mb-1">Ensayes</h5>
                        <small className="text-muted">Detalle de elementos por cada etapa del circuito</small>
                    </div>
                    <ButtonGroup className="d-flex justify-content-end">
                        <Button
                            className={`rounded-pill me-3 ${vistaEnsayes === "tabla" ? "btn-success" : "btn-primary"}`}
                            onClick={() => setVistaEnsayes("tabla")}
                        >
                            Vista de Tabla
                        </Button>
                        <Button
                            className={`rounded-pill ${vistaEnsayes === "graficos" ? "btn-success" : "btn-primary"}`}
                            onClick={() => setVistaEnsayes("graficos")}
                        >
                            Vista de Gráficos
                        </Button>
                    </ButtonGroup>
                </div>

                {vistaEnsayes === "tabla" && (

                    <Table striped hover responsive className="table-sm">
                        <thead>
                            <tr>
                                <th className='fw-bold'>Etapa</th>
                                <th className='fw-bold'>TMS (ton)</th>
                                {Object.values(elementosMapEnsayes).map((nombre, idx) => (
                                    <th key={idx} className="text-end">{nombre}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {detallesEnsaye.circuitos.map((circuito, idx) => {
                                // Usamos la condición correcta Y la palabra `return`
                                return ["Colas Pb", "Colas Zn"].includes(circuito.etapa)
                                    ? null // Si la condición es verdadera, no renderizamos nada (null)
                                    : ( // Si es falsa, renderizamos la fila
                                        <tr key={idx}>
                                            <td>{circuito.etapa}</td>
                                            <td>{circuito.tms}</td>
                                            {[1, 2, 3, 4, 5, 6].map((elementoId) => {
                                                const elemento = circuito.elementos.find(e => e.elemento.id === elementoId);
                                                const valor = elemento?.ley_corregida || 0;
                                                return (
                                                    <td key={elementoId} className="text-end">
                                                        {valor.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                            })}
                        </tbody>
                    </Table>
                )}

                {vistaEnsayes === "graficos" && (
                    <div>
                        <div className="d-flex flex-wrap justify-content-center mb-3 gap-2">
                            {Object.entries(elementosMapEnsayes).map(([id, nombre]) => (
                                <Button
                                    key={id}
                                    variant={activeElementoTab === id ? "success" : "outline-secondary"}
                                    className="rounded-pill"
                                    onClick={() => setActiveElementoTab(id)}
                                >
                                    {nombre}
                                </Button>
                            ))}
                        </div>

                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title className="fw-semibold mb-3">{elementosMapEnsayes[activeElementoTab]} por Etapa</Card.Title>
                                <div style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={prepararDatosGraficoEnsayes(parseInt(activeElementoTab))}
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
                                                name={elementosMapEnsayes[activeElementoTab]}
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

            <Card className="shadow-sm p-4 mt-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                    <div className="mb-2 mb-md-0">
                        <h5 className="fw-bold mb-1">Contenidos</h5>
                        <small className="text-muted">Detalle de elementos por cada etapa del circuito</small>
                    </div>
                    <ButtonGroup className="d-flex justify-content-end">
                        <Button
                            className={`rounded-pill me-3 ${vistaContenidos === "tabla" ? "btn-success" : "btn-primary"}`}
                            onClick={() => setVistaContenidos("tabla")}
                        >
                            Vista de Tabla
                        </Button>
                        <Button
                            className={`rounded-pill ${vistaContenidos === "graficos" ? "btn-success" : "btn-primary"}`}
                            onClick={() => setVistaContenidos("graficos")}
                        >
                            Vista de Gráficos
                        </Button>
                    </ButtonGroup>
                </div>

                {vistaContenidos === "tabla" && (
                    
                    <Table striped hover responsive className="table-sm">
                        <thead>
                            <tr>
                                <th className='fw-bold'>Etapa</th>
                                <th className='fw-bold'>TMS (ton)</th>
                                {Object.values(elementosMapContenidos).map((nombre, idx) => (
                                    <th key={idx} className="text-end">{nombre}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {detallesEnsaye.circuitos.map((circuito, idx) => {
                                // Usamos la condición correcta Y la palabra `return`
                                return ["Colas Pb", "Colas Zn"].includes(circuito.etapa)
                                    ? null // Si la condición es verdadera, no renderizamos nada (null)
                                    : ( // Si es falsa, renderizamos la fila
                                        <tr key={idx}>
                                            <td>{circuito.etapa}</td>
                                            <td>{circuito.tms}</td>
                                            {[1, 2, 3, 4, 5, 6].map((elementoId) => {
                                                const elemento = circuito.elementos.find(e => e.elemento.id === elementoId);
                                                const valor = elemento?.contenido || 0;
                                                return (
                                                    <td key={elementoId} className="text-end">
                                                        {valor.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                            })}
                        </tbody>
                    </Table>
                )}

                {vistaContenidos === "graficos" && (
                    <div>
                        <div className="d-flex flex-wrap justify-content-center mb-3 gap-2">
                            {Object.entries(elementosMapContenidos).map(([id, nombre]) => (
                                <Button
                                    key={id}
                                    variant={activeElementoTab === id ? "success" : "outline-secondary"}
                                    className="rounded-pill"
                                    onClick={() => setActiveElementoTab(id)}
                                >
                                    {nombre}
                                </Button>
                            ))}
                        </div>

                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title className="fw-semibold mb-3">{elementosMapContenidos[activeElementoTab]} por Etapa</Card.Title>
                                <div style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={prepararDatosGraficoContenidos(parseInt(activeElementoTab))}
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
                                                name={elementosMapContenidos[activeElementoTab]}
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

            <Card className="shadow-sm p-4 mt-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                    <div className="mb-2 mb-md-0">
                        <h5 className="fw-bold mb-1">Distribución</h5>
                        <small className="text-muted">Detalle de elementos por cada etapa del circuito</small>
                    </div>
                    <ButtonGroup className="d-flex justify-content-end">
                        <Button
                            className={`rounded-pill me-3 ${vistaDistribucion === "tabla" ? "btn-success" : "btn-primary"}`}
                            onClick={() => setVistaDistribucion("tabla")}
                        >
                            Vista de Tabla
                        </Button>
                        <Button
                            className={`rounded-pill ${vistaDistribucion === "graficos" ? "btn-success" : "btn-primary"}`}
                            onClick={() => setVistaDistribucion("graficos")}
                        >
                            Vista de Gráficos
                        </Button>
                    </ButtonGroup>
                </div>

                {vistaDistribucion === "tabla" && (
                    
                    <Table striped hover responsive className="table-sm">
                        <thead>
                            <tr>
                                <th className='fw-bold'>Etapa</th>
                                <th className='fw-bold'>TMS (ton)</th>
                                {Object.values(elementosMapDistribucion).map((nombre, idx) => (
                                    <th key={idx} className="text-end">{nombre}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {detallesEnsaye.circuitos.map((circuito, idx) => {
                                // Usamos la condición correcta Y la palabra `return`
                                return ["Colas Pb", "Colas Zn"].includes(circuito.etapa)
                                    ? null // Si la condición es verdadera, no renderizamos nada (null)
                                    : ( // Si es falsa, renderizamos la fila
                                        <tr key={idx}>
                                            <td>{circuito.etapa}</td>
                                            <td>{circuito.tms}</td>
                                            {[1, 2, 3, 4, 5, 6].map((elementoId) => {
                                                const elemento = circuito.elementos.find(e => e.elemento.id === elementoId);
                                                const valor = elemento?.distribucion || 0;
                                                return (
                                                    <td key={elementoId} className="text-end">
                                                        {valor.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                            })}
                        </tbody>
                    </Table>
                )}

                {vistaDistribucion === "graficos" && (
                    <div>
                        <div className="d-flex flex-wrap justify-content-center mb-3 gap-2">
                            {Object.entries(elementosMapDistribucion).map(([id, nombre]) => (
                                <Button
                                    key={id}
                                    variant={activeElementoTab === id ? "success" : "outline-secondary"}
                                    className="rounded-pill"
                                    onClick={() => setActiveElementoTab(id)}
                                >
                                    {nombre}
                                </Button>
                            ))}
                        </div>

                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title className="fw-semibold mb-3">{elementosMapDistribucion[activeElementoTab]} por Etapa</Card.Title>
                                <div style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={prepararDatosGraficoDistribucion(parseInt(activeElementoTab))}
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
                                                name={elementosMapDistribucion[activeElementoTab]}
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