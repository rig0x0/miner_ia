// Graph.jsx (Nombre sugerido: GraficasDashboard o similar, ya que "Graph" es muy genérico)
import React, { useEffect, useState, useMemo } from 'react';
import { ButtonGroup, Button, Card, Form, Col, Row, Alert } from 'react-bootstrap';
import { GraphComponent } from '../GraphComponent'; // Tu componente de Recharts
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook

// Estas constantes podrían venir de un archivo de configuración
const ALL_AVAILABLE_ELEMENTS = ['Au', 'Ag', 'Cu', 'Pb', 'Zn', 'Fe'];
const DEFAULT_SELECTED_ELEMENTS = ['Au']; // Elementos mostrados por defecto

export const GraficasDashboard = ({ contenidos, leyes, recuperaciones }) => {
    const { t, i18n } = useTranslation();
    // Estados para los datos procesados (con todos los elementos de la prop)
    const [datosFuente, setDatosFuente] = useState({
        Recuperaciones: { Fechas: [], ...Object.fromEntries(ALL_AVAILABLE_ELEMENTS.map(el => [el, []])) },
        Contenidos: { Fechas: [], ...Object.fromEntries(ALL_AVAILABLE_ELEMENTS.map(el => [el, []])) },
        Leyes: { Fechas: [], ...Object.fromEntries(ALL_AVAILABLE_ELEMENTS.map(el => [el, []])) },
    });

    const [selectedGraphType, setSelectedGraphType] = useState('Recuperaciones');
    const [selectedElements, setSelectedElements] = useState([...DEFAULT_SELECTED_ELEMENTS]);
    const [unidadEjeY, setUnidadEjeY] = useState('%'); // Unidad para el eje Y, especialmente para Contenidos/Leyes

    const GRAFICAS = [
        { key: 'Recuperaciones', label: t('tabs.recuperaciones') },
        { key: 'Contenidos', label: t('tabs.contenidos') },
        { key: 'Leyes', label: t('tabs.leyes') },
    ];

    // Función genérica para procesar los datos de las props
    const processRawData = (rawDataArray) => {
        if (!rawDataArray || rawDataArray.length === 0) {
            return { Fechas: [], ...Object.fromEntries(ALL_AVAILABLE_ELEMENTS.map(el => [el, []])) };
        }

        const processed = { Fechas: [], ...Object.fromEntries(ALL_AVAILABLE_ELEMENTS.map(el => [el, []])) };
        let datesFilled = false;

        rawDataArray.forEach(({ elemento, valores }) => {
            if (!ALL_AVAILABLE_ELEMENTS.includes(elemento)) return;

            const lastValues = valores;
            if (!datesFilled && lastValues.length > 0) {
                try {
                    processed.Fechas = lastValues.map(v => format(new Date(v.date), 'dd/MM/yyyy', { locale: es }));
                    datesFilled = true;
                } catch (e) {
                    console.error("Error formateando fecha:", e);
                }
            }
            processed[elemento] = lastValues.map(v => parseFloat(v.valor) || 0);
        });
        return processed;
    };

    useEffect(() => {
        setDatosFuente(prev => ({
            ...prev,
            Recuperaciones: processRawData(recuperaciones),
            Contenidos: processRawData(contenidos),
            Leyes: processRawData(leyes),
        }));
    }, [recuperaciones, contenidos, leyes]);

    // Handler para cambiar la unidad en Contenidos/Leyes (si es necesario)
    // La prop onUnidadChange que tenías en GraphComponent ahora se maneja aquí o se pasa
    const handleUnidadChange = (nuevaUnidad) => {
        setUnidadEjeY(nuevaUnidad);
    };

    useEffect(() => {
        // Ajustar unidad por defecto al cambiar tipo de gráfica
        if (selectedGraphType === 'Recuperaciones') {
            setUnidadEjeY('%'); // Recuperaciones siempre en %
        } else {
            // Para Contenidos y Leyes, podrías querer empezar con %
            // y dejar que el usuario cambie a g/t si 'Ag' está seleccionado.
            // O si 'Ag' es el único seleccionado y el tipo es Contenido/Ley, poner g/t.
            // Por ahora, lo dejamos simple: % por defecto, y GraphComponent se encarga del switch.
            // O podrías eliminar el switch de unidad de GraphComponent y manejarlo todo aquí.
            setUnidadEjeY('%');
        }
    }, [selectedGraphType]);


    const datosParaGraficaActual = useMemo(() => {
        const dataSet = datosFuente[selectedGraphType];
        if (!dataSet || !dataSet.Fechas || dataSet.Fechas.length === 0) {
            return { Fechas: [], ...Object.fromEntries(selectedElements.map(el => [el, []])) };
        }

        const filteredData = { Fechas: dataSet.Fechas };
        selectedElements.forEach(el => {
            filteredData[el] = dataSet[el] || [];
        });
        return filteredData;
    }, [selectedGraphType, selectedElements, datosFuente]);


    const handleElementToggle = (element) => {
        setSelectedElements(prev =>
            prev.includes(element) ? prev.filter(el => el !== element) : [...prev, element]
        );
    };

    const noDataForCurrentGraph = !datosParaGraficaActual.Fechas || datosParaGraficaActual.Fechas.length === 0 || selectedElements.length === 0;

    return (
        <Card className="border-0  my-4">
            <Card.Header as="h5" className=" py-3 px-4">
                <Row className="align-items-center gy-2"> {/* gy-2 para espaciado vertical en mobile */}
                    
                    <Col className="d-flex justify-content-end"> {/* Botones a la derecha en desktop */}
                        <ButtonGroup size="sm">
                            {GRAFICAS.map(({ key, label }) => (
                                <Button
                                    key={key}
                                    variant={selectedGraphType === key ? 'info' : 'outline-info'}
                                    onClick={() => setSelectedGraphType(key)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Col>
                </Row>
            </Card.Header>

            <Card.Body className="p-3 p-md-4">
                <Form className="mb-3 pb-3 border-bottom">
                    <Row className="align-items-center">
                        <Col md={12}> {/* O md={8} si quieres un botón de "Aplicar todos" en md={4} */}
                            <Form.Label className="fw-semibold fs-sm mb-2">
                                {t("tablero.cardGrafico.selecciondeElemento")}
                            </Form.Label>
                            <div className="d-flex flex-wrap" style={{ gap: '0.5rem 1rem' }}> {/* Mayor gap horizontal */}
                                {ALL_AVAILABLE_ELEMENTS.map(el => (
                                    <Form.Check
                                        type="checkbox"
                                        inline
                                        label={el}
                                        id={`graph-el-check-${el}`}
                                        key={`graph-el-check-${el}`}
                                        checked={selectedElements.includes(el)}
                                        onChange={() => handleElementToggle(el)}
                                        className="mb-1"
                                    />
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Form>

                {noDataForCurrentGraph ? (
                    <Alert variant="info" className="text-center">
                        <i className="fas fa-info-circle me-2"></i>
                        {selectedElements.length === 0
                            ? t("tablero.cardGrafico.seleccionError")
                            : t("tablero.cardGrafico.seleccionNohayDatos")}
                    </Alert>
                ) : (
                    <GraphComponent
                        tipo={selectedGraphType}
                        datosFiltrados={datosParaGraficaActual} // Ya están filtrados por elemento
                        unidadSeleccionada={unidadEjeY} // La unidad actual para el eje Y
                        onUnidadChange={handleUnidadChange} // Permite que GraphComponent cambie la unidad
                        // No necesitas pasar `elementos` a GraphComponent si ya filtraste los datos
                        // y GraphComponent itera sobre las claves de `datosFiltrados` (excluyendo 'Fechas').
                    />
                )}
            </Card.Body>
            
        </Card>
    );
};