import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../../config/axios';
import { CardComponent } from '../CardComponent';
import { GraphComponent } from '../GraphComponent';
import '../ComponentsStyles/Modal.css';
import { TableEnsayes } from '../TableEnsayes';
import { useNavigate } from 'react-router';
import { Card, ButtonGroup } from 'react-bootstrap';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { useInfiniteQuery } from '@tanstack/react-query'
import { CustomSpinner } from '../CustomSpinner';

export const SupervisorDashboard = () => {
    const navigate = useNavigate();

    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [isFiltered, setIsFiltered] = useState(false);

    // ESTADO NUEVO
    const [paginaActual, setPaginaActual] = useState(1); // Página visible actual
    const paginasCargadas = useRef(new Set([0, 1])); // Controla las páginas ya traídas


    // Estados auxiliares solo para el input
    const [inputFechaInicio, setInputFechaInicio] = useState('');
    const [inputFechaFin, setInputFechaFin] = useState('');

    const [fechaTablaInicio, setFechaTablaInicio] = useState("");
    const [fechaTablaFin, setFechaTablaFin] = useState("");

    const getElements = async (endpoint) => {
        const { data } = await clienteAxios.get(endpoint);
        // ERROR CORREGIDO AQUÍ
        console.log(`Data from ${endpoint}:`, data);
        return data;
    };

    const { data: resumen, refetch: refetchResumen, isLoading: isLoadingResumen, error: errorResume } = useQuery({
        queryKey: ['resumen', fechaInicio, fechaFin],
        queryFn: () => {
            let endpoint = '/dashboard/';
            if (isFiltered && fechaInicio && fechaFin) {
                endpoint = `/dashboard/resumen?initial%20date=${fechaInicio}&final%20date=${fechaFin}`;
            }
            return getElements(endpoint);
        },
    });

    // MODIFICADO: trae dos páginas a la vez
    const fetchEnsayesPage = async ({ pageParam = 0 }) => {
        const limit = 10;
        const promises = [pageParam, pageParam + 1].map((p) =>
            clienteAxios.get(`/ensaye/?page=${p}&limit=${limit}`).then((res) => res.data)
        );
        const results = await Promise.all(promises);
        const data = results.flat();

        return {
            data,
            nextPage: data.length === 20 ? pageParam + 2 : undefined, // si se trajeron 20 items, hay más
        };
    };
    const {
        data: paginatedEnsayes,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingTodosEnsayes,
    } = useInfiniteQuery({
        queryKey: ['ensayes-paginados'],
        queryFn: fetchEnsayesPage,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const { data: recuperaciones, isLoading: isLoadingRecuperaciones } = useQuery({
        queryKey: ["recuperaciones"],
        queryFn: () => getElements('/dashboard/recuperaciones'),
        enabled: !!resumen?.resumen
    });

    const { data: contenidosData, isLoading: isLoadingContenidos } = useQuery({
        queryKey: ["contenidos"],
        queryFn: () => getElements('/dashboard/contenidos'),
        enabled: !!resumen?.resumen
    });

    const { data: leyesData, isLoading: isLoadingLeyes } = useQuery({
        queryKey: ["leyes"],
        queryFn: () => getElements('/dashboard/leyes'),
        enabled: !!resumen?.resumen
    });

    const [datosRecuperaciones, setDatosRecuperaciones] = useState({ Fechas: [], Au: [], Ag: [], Cu: [], Pb: [], Zn: [], Fe: [] });
    const [datosContenidos, setDatosContenidos] = useState({ Fechas: [], Au: [], Ag: [], Cu: [], Pb: [], Zn: [], Fe: [] });
    const [datosLeyes, setDatosLeyes] = useState({ Fechas: [], Au: [], Ag: [], Cu: [], Pb: [], Zn: [], Fe: [] });
    const [selectedGraph, setSelectedGraph] = useState('Recuperaciones');
    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);

    useEffect(() => {
        if (recuperaciones?.recuperaciones) {
            const newData = { Fechas: [], Au: [], Ag: [], Cu: [], Pb: [], Zn: [], Fe: [] };
            recuperaciones.recuperaciones.forEach(({ elemento, valores }) => {
                const ultimos = valores.slice(-7);
                if (newData.Fechas.length === 0) {
                    newData.Fechas = ultimos.map(v => v.date);
                }
                newData[elemento] = ultimos.map(v => v.valor);
            });
            setDatosRecuperaciones(newData);
        }
    }, [recuperaciones]);

    useEffect(() => {
        if (contenidosData?.contenidos) {
            const newData = { Fechas: [], Au: [], Ag: [], Cu: [], Pb: [], Zn: [], Fe: [] };
            contenidosData.contenidos.forEach(({ elemento, valores }) => {
                const ultimos = valores.slice(-7);
                if (newData.Fechas.length === 0) {
                    newData.Fechas = ultimos.map(v => v.date);
                }
                newData[elemento] = ultimos.map(v => v.valor);
            });
            setDatosContenidos(newData);
        }
    }, [contenidosData]);

    useEffect(() => {
        if (leyesData?.leyes) {
            const newData = { Fechas: [], Au: [], Ag: [], Cu: [], Pb: [], Zn: [], Fe: [] };
            leyesData.leyes.forEach(({ elemento, valores }) => {
                const ultimos = valores.slice(-7);
                if (newData.Fechas.length === 0) {
                    newData.Fechas = ultimos.map(v => v.date);
                }
                newData[elemento] = ultimos.map(v => v.valor);
            });
            setDatosLeyes(newData);
        }
    }, [leyesData]);

    const isLoadingGeneral = isLoadingResumen || isLoadingRecuperaciones || isLoadingContenidos || isLoadingLeyes;

    const handleVerEnsaye = (idEnsaye) => {
        // ERROR CORREGIDO AQUÍ
        console.log("Fecha original enviada como prop:", idEnsaye); // Dejé el console.log aquí por si era intencional
        navigate(`/detalles-ensaye/${idEnsaye}`);
    };

    // Generar datos para la tabla
    const datosEnsayes = useMemo(() => {
        return paginatedEnsayes?.pages.flatMap((page) =>
            page.data.map((ensaye) => ({
                FECHA: format(new Date(ensaye.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es }),
                FECHA_ORIGINAL: ensaye.fecha,
                TURNO: ensaye.turno,
                TIPODE_ENSAYE: ensaye.tipo_ensaye,
                USER_ID: ensaye.user?.name,
                CABEZA_GENERAL: ensaye.producto?.cabeza_general + " t" || 0,
                ID_ENSAYE: ensaye.id,
                original: ensaye,
            }))
        );
    }, [paginatedEnsayes]);


    const columnasTabla = [
        { header: 'Fecha', accessorKey: 'FECHA' },
        { header: 'Turno', accessorKey: 'TURNO' },
        { header: 'Tipo de Ensaye', accessorKey: 'TIPODE_ENSAYE' },
        { header: 'Nombre de Usuario', accessorKey: 'USER_ID' },
        { header: 'Cabeza General', accessorKey: 'CABEZA_GENERAL' },
        {
            id: 'acciones',
            header: 'Acciones',
            cell: ({ row }) => {
                const idEnsaye = row.original.ID_ENSAYE;
                return (
                    <td className="d-flex justify-content-center white-space-nowrap text-end pe-0">
                        <div className="btn-reveal-trigger position-static">
                            <button
                                className="btn btn-primary btn-sm dropdown-toggle dropdown-caret-none transition-none fs-10"
                                type="button"
                                title="Ver ensaye"
                                onClick={() => {
                                    handleVerEnsaye(idEnsaye);
                                }}
                            >
                                <span className="fas fa-eye"></span>
                            </button>
                        </div>
                    </td>
                );
            },
        }

    ];

    // Lógica para detectar si necesitas cargar más páginas
    useEffect(() => {
        const totalEnsayes = datosEnsayes?.length || 0;
        const ensayesPorPagina = 10;
        const maxPaginaVisible = Math.ceil(totalEnsayes / ensayesPorPagina);

        if (
            paginaActual + 1 >= maxPaginaVisible && // si el usuario está cerca del final
            hasNextPage &&
            !isFetchingNextPage &&
            !paginasCargadas.current.has(maxPaginaVisible)
        ) {
            fetchNextPage();
            paginasCargadas.current.add(maxPaginaVisible);
        }
    }, [paginaActual, datosEnsayes, fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Callback para pasar a TableEnsayes
    const handlePaginaCambio = (nuevaPagina) => {
        setPaginaActual(nuevaPagina);
    };

    const handleUnidadChange = (unidad) => {
        setUnidadSeleccionada(unidad);
    };

    useEffect(() => {
        if (selectedGraph === 'Contenidos' || selectedGraph === 'Leyes') {
            setUnidadSeleccionada('%');
        } else {
            setUnidadSeleccionada(null);
        }
    }, [selectedGraph]);

    if (isLoadingGeneral) {
        return <CustomSpinner />
    }

    return (
        <div>
            <div className="mb-3">
                <div className='d-flex justify-content-between align-items-center'>
                    <h5 className="mb-2 fs-6">Tarjetas comparativas por elemento</h5>
                    {/* Filtro por fechas */}
                    <div class="btn-reveal-trigger position-static">
                        <button class="btn btn-primary btn-sm dropdown-toggle dropdown-caret-none transition-none  fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent">
                            <span class="fas fa-filter fs-9"></span>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end py-2">
                            <div>
                                <label className="form-label">Fecha Inicio</label>
                                <input
                                    type="date"
                                    className="dropdown-item form-control"
                                    value={inputFechaInicio}
                                    onInput={(e) => setInputFechaInicio(e.target.value)} // <-- NO onChange
                                />
                            </div>

                            <div>
                                <label className="form-label">Fecha Fin</label>
                                <input
                                    type="date"
                                    className="dropdown-item form-control"
                                    value={inputFechaFin}
                                    onInput={(e) => setInputFechaFin(e.target.value)} // <-- NO onChange
                                />
                            </div>
                            <div class="dropdown-divider">
                            </div>
                            <div className='p-1'>
                                <button
                                    className="btn btn-primary mx-2"
                                    onClick={() => {
                                        if (inputFechaInicio && inputFechaFin) {
                                            setFechaInicio(inputFechaInicio);
                                            setFechaFin(inputFechaFin);
                                            setIsFiltered(true);
                                            refetchResumen();
                                        }
                                    }}
                                >
                                    Filtrar
                                </button>

                                <button
                                    className=" btn btn-secondary"
                                    onClick={() => {
                                        setFechaInicio(null);
                                        setFechaFin(null);
                                        setInputFechaInicio('');
                                        setInputFechaFin('');
                                        setIsFiltered(false);
                                        refetchResumen();
                                    }}
                                >
                                    Limpiar Filtro
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            {/* Tarjetas con datos filtrados o del último ensaye */}
            <div>
                {
                    errorResume ? (
                        <p>Ocurrió un error</p>
                    ) : (
                        <CardComponent
                            elementos={resumen?.resumen?.slice(0, 6).map(item => {
                                const esAgAu = ['Ag'].includes(item.elemento);
                                const unidadLeyContenido = esAgAu ? 'g/t' : '%';
                                return {
                                    ...item,
                                    unidad: {
                                        recuperacion: '%',
                                        ley: unidadLeyContenido,
                                        contenido: unidadLeyContenido
                                    }
                                };
                            })}
                        />
                    )
                }

            </div>
            <Card className='my-3'>
                <div>
                    <h5 className="mb-1 fs-6">Datos por Circuito</h5>
                    <small className=" fs-9">Detalle de elementos por cada etapa del circuito de los ultimos 7 ensayes subidos</small>
                </div>
                <div className="d-flex justify-content-center mt-3 fondoBtnVista" >
                    <ButtonGroup className='p-2 w-100 justify-content-center'>
                        {['Recuperaciones', 'Contenidos', 'Leyes'].map((tipo) => (
                            <button
                                key={tipo}
                                // ERROR CORREGIDO AQUÍ
                                className={`btn ${selectedGraph === tipo ? 'botonActivoDetalles' : 'botonInactivoDetalles'}`}
                                onClick={() => setSelectedGraph(tipo)}
                                style={{ borderRadius: '6px' }}
                            >
                                {tipo}
                            </button>
                        ))}
                    </ButtonGroup>
                </div>
                {selectedGraph === 'Recuperaciones' && <GraphComponent tipo="Recuperaciones" datosFiltrados={datosRecuperaciones} />}
                {selectedGraph === 'Contenidos' && (
                    <GraphComponent
                        tipo="Contenidos"
                        datosFiltrados={datosContenidos}
                        unidadSeleccionada={unidadSeleccionada}
                        onUnidadChange={handleUnidadChange}
                    />
                )}
                {selectedGraph === 'Leyes' && (
                    <GraphComponent
                        tipo="Leyes"
                        datosFiltrados={datosLeyes}
                        unidadSeleccionada={unidadSeleccionada}
                        onUnidadChange={handleUnidadChange}
                    />
                )}
            </Card>
            <Card>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='pb-3'>
                        <h5 className="mb-1 fs-6">Tabla de Ensayes</h5>
                        <small className=" fs-9">Informacion relevante de los ensayes subidos</small>
                    </div>
                    {/* Filtro por fechas */}
                    <div class="btn-reveal-trigger position-static">
                        <button class="btn btn-primary btn-sm dropdown-toggle dropdown-caret-none transition-none  fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent">
                            <span class="fas fa-filter fs-9"></span>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end py-2">
                            <div>
                                <label className="form-label">Fecha Inicio</label>
                                <input
                                    type="date"
                                    className="dropdown-item form-control"
                                    value={fechaTablaInicio}
                                    onChange={(e) => setFechaTablaInicio(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="form-label">Fecha Fin</label>
                                <input
                                    type="date"
                                    className="dropdown-item form-control"
                                    value={fechaTablaFin}
                                    onChange={(e) => setFechaTablaFin(e.target.value)}
                                />
                            </div>
                            <div class="dropdown-divider">
                            </div>
                            <div className='align-items-center'>
                                <button
                                    className=" btn btn-secondary"
                                    onClick={() => {
                                        setFechaTablaInicio("");
                                        setFechaTablaFin("");

                                    }}
                                >
                                    Limpiar Filtro
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <TableEnsayes
                    data={datosEnsayes}
                    columns={columnasTabla}
                    paginaActual={paginaActual}
                    onPaginaCambio={handlePaginaCambio}
                />

            </Card>
        </div>
    );
};