import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import React, { useState } from 'react'

export const Table = ({ data, columns, placeholder, addButton }) => {

    const [sorting, setSorting] = useState([])
    const [filtering, setFiltering] = useState("")
    // const [selectedRole, setSelectedRole] = useState(""); 

    // // Obtener valores únicos de la columna "status"
    // const uniqueRoles = [...new Set(data.map((item) => item.rol.name))];

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

            <div className="row d-flex justify-content-between">
                <div className="col-3">
                    <div class="search-box">
                        <form class="position-relative">
                            <input
                                class="form-control search-input search"
                                placeholder={placeholder}
                                type="text"
                                value={filtering}
                                onChange={e => setFiltering(e.target.value)}
                            />
                            <span class="fas fa-search search-box-icon"></span>
                        </form>
                    </div>
                </div>
                <div className="col-2">
                    {
                        addButton && (
                            <button
                                className={addButton.className}
                                onClick={addButton.onClick}
                            >
                                {
                                    addButton.icon && (
                                        <span className={addButton.icon.className}></span>
                                    )
                                }
                                {addButton.text}
                            </button>
                        )
                    }
                </div>
            </div>

            {
                <>
                    <div className='table-responsive '>
                        <table className='text-center table table-hover table-sm bg-white fs-9 mb-3 mt-4'>
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
                            <tbody className=''>
                                {table.getRowModel().rows.map(row => (
                                    <tr
                                        className="text-black odd:bg-gray-100 even:bg-white hover:bg-gray-200 transition-all border-b border-gray-300"
                                        key={row.id}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="py-2 px-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                    <p className='fw-bolder text-dark'>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</p>
                    <div className="row">
                        <div className="col-1">
                            <button
                                className="btn btn-sm btn-dark mx-1"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {'<<'}
                            </button>
                        </div>
                        <div className="col-2">
                            <button
                                className="btn btn-sm btn-dark mx-1"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {'Página Anterior'}
                            </button>
                        </div>
                        <div className="col-2">
                            <button
                                className="btn btn-sm btn-dark mx-1"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                {'Siguiente Página'}
                            </button>
                        </div>
                        <div className="col-1">
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
            }
        </>
    )
}
