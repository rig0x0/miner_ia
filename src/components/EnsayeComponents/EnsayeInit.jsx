import React from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import clienteAxios from '../../config/axios';
import { throwNotification } from '../../helpers/ThrowNotification';
import { ToastContainer } from 'react-bootstrap';
import { Table } from '../Table'
import { TableTest } from '../TableTest';
import { ServerSideTable } from '../ServerSideTable';
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook

export const EnsayeInit = () => {
    const { t, i18n } = useTranslation();

    // const queryClient = useQueryClient();

    // const getEssays = async ({ page = 0, pageSize = 10 }) => {
    //     const { data } = await clienteAxios.get(`/api/ensayista?page=${page}&limit=${pageSize}`)
    //     console.log(data)
    //     return data
    // }

    // const { data: ensayes, error, isLoading } = useQuery({
    //     queryKey: ["ensayes"],
    //     queryFn: getEssays,
    // });

    const fetchEnsayes = async (params) => {
        const queryParams = new URLSearchParams();

        // Solo agregar parámetros definidos
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const response = await clienteAxios(`/ensaye/ensayista?${queryParams.toString()}`);
        console.log(response)
        if (!response.status === 200) {
            throw new Error('Error al cargar los ensayes');
        }
        return response;
    };


    const columns = [
        {
            header: 'ID',
            accessorKey: 'id'
        },
        {
            header: t("ensayesVista.fecha"),
            accessorKey: 'fecha',
            cell: ({ row }) => {
                const date = new Date(row.original.fecha);
                return date.toLocaleString();
            }
        },
        {
            header: t("ensayesVista.turno"),
            accessorKey: 'turno'
        },
        {
            header: t("ensayesVista.tipo"),
            accessorKey: 'tipo_ensaye'
        },
        {
            header: t("ensayesVista.molienda"),
            accessorKey: 'producto.molienda_humeda',
            cell: ({ row }) => row.original.producto?.molienda_humeda?.toFixed(2) || 'N/A'
        },
        {
            header: t("ensayesVista.humedad"),
            accessorKey: 'producto.humedad',
            cell: ({ row }) => `${row.original.producto?.humedad || 0}%`
        },
        {
            header: t("ensayesVista.cabeza"),
            accessorKey: 'producto.cabeza_general',
            cell: ({ row }) => row.original.producto?.cabeza_general?.toFixed(2) || 'N/A'
        }
    ];

    const filtersConfig = [
        {
            id: 'shift',
            label: t("ensayesVista.turno"),
            type: 'select',
            options: [
                { value: 1, label: t("ensayesVista.turno1") },
                { value: 2, label: t("ensayesVista.turno2") },
            ]
        },
        {
            id: 'laboratory',
            label: t("ensayesVista.laboratorio"),
            type: 'select',
            options: [
                { value: 'Laboratorio Conciliado', label: t("ensayesVista.conciliado") },
                { value: 'Laboratorio Real', label: t("ensayesVista.real") },
            ]
        }
    ];

    return (
        <>
            <style>
                {`
    .card-hover {
        transition: all 0.4s ease;
        border: 1px solid #dee2e6;
        border-radius: 0.75rem;
        background-color: #ffffff;
    }

    .card-hover:hover {
       background: linear-gradient(135deg, #e3f2fd, #fff);
        box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1);
        transform: translateY(-4px) scale(1.02);
    }

    .card-icon {
        font-size: 2.5rem;
        color: #495057;
        transition: color 0.3s ease;
    }

    .card-hover:hover .card-icon {
        color: #0d6efd;
    }
`}
            </style>
            <div className="mb-4">
                {/* Encabezado */}
                <div className="row mb-3">
                    <div className="col">
                        <h1 className="fw-bold">{t("ensayista.titulo")}</h1>
                        <p className="text-muted">{t("ensayista.descripcion")}</p>
                    </div>
                </div>

                {/* Acciones rápidas */}
                <div className="">
                    {/* <h2 className="mb-2 fw-semibold">Acciones Rápidas</h2>
                    <p className="text-muted mb-4">Accede rápidamente a las funciones principales</p> */}

                    <div className="row g-4 d-flex">
                        {/* Card: Registrar Nuevo Ensaye */}
                        <div className="col-md-3">
                            <Link to={'/registrar-ensaye'} class="nav-link">
                                <div className="card card-hover h-100 shadow-sm cursor-pointer">
                                    <div className="card-body d-flex flex-column justify-content-between text-center">
                                        <div>
                                            <h3 className="fw-bold">{t("ensayista.registrar")}</h3>
                                            <p className="text-muted">{t("ensayista.registrarDescripcion")}</p>
                                        </div>
                                        <div>
                                            <span className="fs-1 fa-solid fa-file-medical card-icon"></span>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                        </div>
                        {/* <div className="col-md-6">
                            <Link to={'/ver-ensayes'} class="nav-link">
                                <div className="card card-hover h-100 shadow-sm cursor-pointer">
                                    <div className="card-body d-flex flex-column justify-content-between text-center">
                                        <div>
                                            <h3 className="fw-bold">Ver Todos Mis Ensayes</h3>
                                            <p className="text-muted">Historial completo de todos tus ensayes</p>
                                        </div>
                                        <div>
                                            <span className="fs-1 fa-solid fa-database card-icon"></span>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                        </div> */}
                    </div>
                </div>

                <div className='mt-4'>
                    <div className="card">
                        <div className="card-header">
                            <h4 className='fw-bold mb-3'>{t("ensayista.cardTitle")}</h4>
                            <ServerSideTable
                                columns={columns}
                                fetchData={fetchEnsayes}
                                queryKey="ensayes"
                                initialPageSize={5}
                                filtersConfig={filtersConfig}
                                enableDateFilter={true}
                                enableGlobalSearch={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer
            />
        </>
    )
}
