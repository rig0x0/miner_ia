import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../../config/axios';
import { CardComponent } from '../CardComponent'; // Asegúrate que la ruta es correcta
// import { CustomSpinner } from '../CustomSpinner'; // Descomenta si lo usarás
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Asegúrate de importarlo globalmente o aquí
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { Alert, Button, Card, Form, Row, Col } from 'react-bootstrap';

// Helper para formatear la fecha para la API
const getApiFormattedDate = (date) => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd');
};

// La prop se renombra a initialDataFromParent para mayor claridad
export const ResumeComponent = ({ dataResume: initialDataFromParent }) => {
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    // Este estado indica si el filtro local del componente está activo y se deben mostrar sus resultados
    const [isLocallyFiltered, setIsLocallyFiltered] = useState(false);

    const getResumeWithApiFilters = async (apiFechaInicio, apiFechaFin) => {
        // La llamada solo se hará si apiFechaInicio y apiFechaFin tienen valor,
        // gestionado por la lógica en queryFn y el botón de Filtrar.
        const endpoint = `/dashboard/resumen?init_date=${apiFechaInicio}&final_date=${apiFechaFin}`;
        const { data } = await clienteAxios.get(endpoint);
        console.log(data)
        return data; // Se espera que la API devuelva { resumen: [...] } o similar
    };

    const {
        data: locallyFilteredData, // Datos obtenidos por el filtro de este componente
        isLoading: isLoadingLocallyFiltered,
        error: errorLocallyFiltered,
        refetch: refetchLocalFilterData,
        isFetching: isFetchingLocallyFiltered,
    } = useQuery({
        // Usar las fechas formateadas en el queryKey asegura que la caché funcione bien
        // y que la query se reevalúe solo si estas fechas cambian y se hace refetch.
        queryKey: ['resumeComponentLocalFilter', getApiFormattedDate(fechaInicio), getApiFormattedDate(fechaFin)],
        queryFn: () => {
            const apiFI = getApiFormattedDate(fechaInicio);
            const apiFF = getApiFormattedDate(fechaFin);
            // Esta condición es una salvaguarda, refetch no debería llamarse si no hay fechas.
            if (!apiFI || !apiFF) return Promise.resolve(null);
            return getResumeWithApiFilters(apiFI, apiFF);
        },
        enabled: false, // No se ejecuta al montar, solo con refetch()
        // refetchOnWindowFocus: false, // Opcional
    });

    const handleFiltrar = () => {
        if (fechaInicio && fechaFin) {
            if (fechaInicio > fechaFin) {
                alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
                return;
            }
            setIsLocallyFiltered(true); // Activa la vista de datos filtrados localmente
            refetchLocalFilterData();    // Ejecuta la query con las nuevas fechas
        } else {
            alert("Por favor, seleccione ambas fechas.");
        }
    };

    const handleLimpiarFiltro = () => {
        setFechaInicio(null);
        setFechaFin(null);
        setIsLocallyFiltered(false); // Desactiva la vista de datos filtrados, volviendo a initialDataFromParent
    };

    const today = new Date();

    // Mapeo de datos para CardComponent (se puede extraer si se repite mucho)
    const mapDataForCardComponent = (item) => {
        const esAgAu = ['Ag', 'Au'].includes(item.elemento);
        const unidadLeyContenido = esAgAu ? 'g/t' : '%';
        return {
            ...item,
            unidad: {
                recuperacion: '%',
                ley: unidadLeyContenido,
                contenido: unidadLeyContenido,
            },
        };
    };

    // Decide qué datos mostrar en CardComponent
    const dataToDisplayInCards = useMemo(() => {
        if (isLocallyFiltered) {
            // Si se filtró localmente, usa los datos de locallyFilteredData.resumen
            // Asegúrate de que locallyFilteredData y locallyFilteredData.resumen existan y sean un array
            return Array.isArray(locallyFilteredData?.resumen) ? locallyFilteredData.resumen : [];
        }
        // Si no, usa los datos iniciales del padre.
        // Si initialDataFromParent es un string (mensaje de error del padre), no será un array.
        return Array.isArray(initialDataFromParent) ? initialDataFromParent : [];
    }, [isLocallyFiltered, locallyFilteredData, initialDataFromParent]);


    // Renderizado del contenido principal (spinner, error, datos)
    let contentArea;
    if (isLocallyFiltered) { // Si el filtro local está activo
        if (isLoadingLocallyFiltered || isFetchingLocallyFiltered) {
            contentArea = <div className="text-center p-3"><p>Filtrando resumen...</p>{/* <CustomSpinner /> */}</div>;
        } else if (errorLocallyFiltered) {
            contentArea = (
                <Alert variant="danger" className="mt-3">
                    <Alert.Heading as="h6">Error al Filtrar Resumen</Alert.Heading>
                    <p className="mb-0 fs-sm">{errorLocallyFiltered.message || "Ocurrió un error desconocido al aplicar el filtro."}</p>
                </Alert>
            );
        } else if (dataToDisplayInCards.length > 0) {
            contentArea = <CardComponent elementos={dataToDisplayInCards.slice(0, 6).map(mapDataForCardComponent)} />;
        } else { // No hay datos para el filtro local aplicado
            contentArea = (
                 <Alert variant="info" className="mt-3 text-center">
                    No se encontraron datos de resumen para las fechas seleccionadas en el filtro.
                    {locallyFilteredData?.message && <p className="mt-1 fs-xs">{locallyFilteredData.message}</p>}
                </Alert>
            );
        }
    } else { // Mostrando datos iniciales del padre
        if (typeof initialDataFromParent === 'string') {
            // El padre envió un mensaje (probablemente un error o "no hay datos" para esta sección)
            contentArea = <Alert variant="warning" className="mt-3 text-center">{initialDataFromParent}</Alert>;
        } else if (dataToDisplayInCards.length > 0) {
            contentArea = <CardComponent elementos={dataToDisplayInCards.slice(0, 6).map(mapDataForCardComponent)} />;
        } else {
            // initialDataFromParent es un array vacío, null, o undefined
            contentArea = (
                <Alert variant="light" className="mt-3 border text-center">
                    <i className="fas fa-info-circle me-2"></i>
                    No hay datos de resumen iniciales disponibles. Puede filtrar para buscar datos específicos.
                </Alert>
            );
        }
    }

    return (
        <Card className="border-0">
            
            <Card.Body className="p-3 p-md-4"> 
                {/* <Row className="g-3 align-items-end mb-4 pb-3 border-bottom">
                    <Col lg={4} md={6} sm={12}> 
                        <Form.Group controlId="fechaInicioResumenComponent"> 
                            <Form.Label className="fs-sm fw-medium mb-1">Fecha Inicio:</Form.Label>
                            <DatePicker
                                selected={fechaInicio}
                                onChange={(date) => setFechaInicio(date)}
                                selectsStart
                                startDate={fechaInicio}
                                endDate={fechaFin}
                                maxDate={today}
                                dateFormat="dd/MM/yyyy"
                                locale={es}
                                placeholderText="dd/mm/aaaa"
                                className="form-control form-control-sm"
                                wrapperClassName="w-100"
                                isClearable // Permite limpiar la fecha
                            />
                        </Form.Group>
                    </Col>
                    <Col lg={4} md={6} sm={12}>
                        <Form.Group controlId="fechaFinResumenComponent"> 
                            <Form.Label className="fs-sm fw-medium mb-1">Fecha Fin:</Form.Label>
                            <DatePicker
                                selected={fechaFin}
                                onChange={(date) => setFechaFin(date)}
                                selectsEnd
                                startDate={fechaInicio}
                                endDate={fechaFin}
                                minDate={fechaInicio}
                                maxDate={today}
                                dateFormat="dd/MM/yyyy"
                                locale={es}
                                placeholderText="dd/mm/aaaa"
                                className="form-control form-control-sm"
                                wrapperClassName="w-100"
                                isClearable
                            />
                        </Form.Group>
                    </Col>
                    <Col lg={4} md={12} className="d-flex gap-2 align-self-end justify-content-start mt-3 mt-md-0">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleFiltrar}
                            disabled={isFetchingLocallyFiltered || isLoadingLocallyFiltered || !fechaInicio || !fechaFin} // Deshabilita si no hay fechas
                        >
                            <i className="fas fa-filter me-1"></i>Filtrar
                        </Button>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleLimpiarFiltro}
                            disabled={isFetchingLocallyFiltered || isLoadingLocallyFiltered}
                        >
                            <i className="fas fa-times me-1"></i>Limpiar
                        </Button>
                    </Col>
                </Row> */}

                {contentArea}

            </Card.Body>
        </Card>
    );
};