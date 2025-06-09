import React from 'react'
import { ServerSideTable } from '../ServerSideTable';
import clienteAxios from '../../config/axios';
import { useNavigate } from 'react-router';
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook

export const EnsayesInit = () => {
    const { t, i18n } = useTranslation();

    const navigate = useNavigate();

    const fetchEnsayes = async (params) => {
        const queryParams = new URLSearchParams();

        // Solo agregar parámetros definidos
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const response = await clienteAxios(`/ensaye?${queryParams.toString()}`);
        console.log(response)
        if (!response.status === 200) {
            throw new Error('Error al cargar los ensayes');
        }
        return response;
    };

    const handleVerEnsaye = (idEnsaye) => {
        navigate(`/detalles-ensaye/${idEnsaye}`);
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
        },
        {
            id: 'acciones',
            header: t("ensayesVista.acciones"),
            cell: ({ row }) => {
                const idEnsaye = row.original.id;
                return (
                    <td className="">
                        <div className="">
                            <button
                                className="btn btn-primary btn-sm "
                                type="button"
                                title={t("ensayesVista.verMas")}
                                onClick={() => {
                                    handleVerEnsaye(idEnsaye);
                                }}
                            >
                                <span className="fas fa-eye">Ver mas</span>
                            </button>
                        </div>
                    </td>
                );
            },
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
            <div className="container py-4">
                <h1 className="h3 fw-bold">{t("ensayesVista.titulo")}</h1>
                <p className="text-muted">{t("ensayesVista.descripcion")}</p>
                <div className="card shadow-sm">
                    <div className="card-header">
                        <h4 className='fw-bold mb-3'>{t("ensayesVista.tituloCard")}</h4>
                        <ServerSideTable
                            columns={columns}
                            fetchData={fetchEnsayes}
                            queryKey="ensayes"
                            initialPageSize={5}
                            filtersConfig={filtersConfig}
                            enableDateFilter={true}
                            enableGlobalSearch={false}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
