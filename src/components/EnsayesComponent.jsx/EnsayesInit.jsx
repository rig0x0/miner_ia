import React from 'react'
import { ServerSideTable } from '../ServerSideTable';
import clienteAxios from '../../config/axios';
import { useNavigate } from 'react-router';

export const EnsayesInit = () => {

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
            header: 'Fecha',
            accessorKey: 'fecha',
            cell: ({ row }) => {
                const date = new Date(row.original.fecha);
                return date.toLocaleString();
            }
        },
        {
            header: 'Turno',
            accessorKey: 'turno'
        },
        {
            header: 'Tipo de Ensaye',
            accessorKey: 'tipo_ensaye'
        },
        {
            header: 'Molienda Húmeda',
            accessorKey: 'producto.molienda_humeda',
            cell: ({ row }) => row.original.producto?.molienda_humeda?.toFixed(2) || 'N/A'
        },
        {
            header: 'Humedad',
            accessorKey: 'producto.humedad',
            cell: ({ row }) => `${row.original.producto?.humedad || 0}%`
        },
        {
            header: 'Cabeza General',
            accessorKey: 'producto.cabeza_general',
            cell: ({ row }) => row.original.producto?.cabeza_general?.toFixed(2) || 'N/A'
        },
        {
            id: 'acciones',
            header: 'Acciones',
            cell: ({ row }) => {
                const idEnsaye = row.original.id;
                return (
                    <td className="">
                        <div className="">
                            <button
                                className="btn btn-primary btn-sm "
                                type="button"
                                title="Ver ensaye"
                                onClick={() => {
                                    handleVerEnsaye(idEnsaye);
                                }}
                            >
                                <span className="fas fa-eye">Ver más</span>
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
            label: 'Turno',
            type: 'select',
            options: [
                { value: 1, label: 'Turno 1' },
                { value: 2, label: 'Turno 2' },
            ]
        },
        {
            id: 'laboratory',
            label: 'Laboratorio',
            type: 'select',
            options: [
                { value: 'Laboratorio Conciliado', label: 'Conciliado' },
                { value: 'Laboratorio Real', label: 'Real' },
            ]
        }
    ];

    return (
        <>
            <div className="container py-4">
                <h1 className="h3 fw-bold">Ensayes</h1>
                <p className="text-muted">Visualiza los ensayes registrados en la plataforma</p>
                <div className="card shadow-sm">
                    <div className="card-header">
                        <h4 className='fw-bold mb-3'>Historial de Ensayes Registrados</h4>
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
