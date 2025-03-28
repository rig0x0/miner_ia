import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import React, { useState } from 'react'

export const UsersTable = ({ data, columns, placeholder }) => {

    const [sorting, setSorting] = useState([])
    const [filtering, setFiltering] = useState("")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting: sorting,
            globalFilter: filtering
        },
        onGlobalFilterChange: setFiltering,
        onSortingChange: setSorting,

    })



    return (
        <>

            <div className="col-5 row">
                <div className="form-group">
                    <label htmlFor="">Buscar</label>
                    <input
                        placeholder={placeholder}
                        className='form-control'
                        type="text"
                        value={filtering}
                        onChange={e => setFiltering(e.target.value)}
                    />
                </div>
            </div>

            {
                data && columns(
                    <>
                        <table className='text-center table'>
                            <thead className='text-center'>
                                {
                                    table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {
                                                headerGroup.headers.map(header => (
                                                    <th className='text-center' key={header.id}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {
                                                            header.isPlaceholder ? null : (
                                                                <div>
                                                                    {flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}

                                                                    {
                                                                        { asc: '⬆️', desc: '⬇️' }[
                                                                        header.column.getIsSorted() ?? null
                                                                        ]
                                                                    }
                                                                </div>
                                                            )
                                                        }

                                                    </th>
                                                ))
                                            }
                                        </tr>
                                    ))
                                }
                            </thead>
                            <tbody>
                                {
                                    table.getRowModel().rows.map(row => (
                                        <tr className='text-black' key={row.id}
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>

                        <p className='fw-bolder text-dark'>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</p>
                        <div className="row">
                            <div className="col-3">
                                <button
                                    className="btn btn-sm btn-dark mx-1"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<<'}
                                </button>
                            </div>
                            <div className="col-3">
                                <button
                                    className="btn btn-sm btn-dark mx-1"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'Página Anterior'}
                                </button>
                            </div>
                            <div className="col-3">
                                <button
                                    className="btn btn-sm btn-dark mx-1"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'Siguiente Página'}
                                </button>
                            </div>
                            <div className="col-3">
                                <button
                                    className="btn btn-sm btn-dark mx-1"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'>>'}
                                </button>
                            </div>
                        </div>
                    </>

                )
            }



        </>
    )
}
