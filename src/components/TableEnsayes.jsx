import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getFilteredRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import React, { useState } from 'react'

export const TableEnsayes = ({
    data,
    columns,
    placeholder,
    addButton,
    pageIndex = 0,
    onNextPage,
    onPreviousPage,
    onFirstPage,
    onLastPage,
}) => {

    const [sorting, setSorting] = useState([])
    const [filtering, setFiltering] = useState("")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            globalFilter: filtering
        },
        onGlobalFilterChange: setFiltering,
        onSortingChange: setSorting,
    })

    return (
        <>
            <div className="row d-flex justify-content-between">
                <div className="col-3">
                    <div className="search-box">
                        <form className="position-relative">
                            <input
                                className="form-control search-input search"
                                placeholder={placeholder}
                                type="text"
                                value={filtering}
                                onChange={e => setFiltering(e.target.value)}
                            />
                            <span className="fas fa-search search-box-icon"></span>
                        </form>
                    </div>
                </div>
                <div className="col-2">
                    {addButton && (
                        <button
                            className={addButton.className}
                            onClick={addButton.onClick}
                        >
                            {addButton.icon && (
                                <span className={addButton.icon.className}></span>
                            )}
                            {addButton.text}
                        </button>
                    )}
                </div>
            </div>

            <div className='table-responsive'>
                <table className='text-center table table-hover table-sm bg-white fs-9 mb-3 mt-4'>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className='text-center'
                                    >
                                        {header.isPlaceholder ? null : (
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
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className="text-black odd:bg-gray-100 even:bg-white hover:bg-gray-200 transition-all border-b border-gray-300"
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

            <p className='fw-bolder text-dark'>Página {pageIndex + 1}</p>
            <div className="row">
                <div className="col-1">
                    <button
                        className="btn btn-sm btn-dark mx-1"
                        onClick={onFirstPage}
                    >
                        {'<<'}
                    </button>
                </div>
                <div className="col-2">
                    <button
                        className="btn btn-sm btn-dark mx-1"
                        onClick={onPreviousPage}
                    >
                        {'Página Anterior'}
                    </button>
                </div>
                <div className="col-2">
                    <button
                        className="btn btn-sm btn-dark mx-1"
                        onClick={onNextPage}
                    >
                        {'Siguiente Página'}
                    </button>
                </div>
                <div className="col-1">
                    <button
                        className="btn btn-sm btn-dark mx-1"
                        onClick={onLastPage}
                    >
                        {'>>'}
                    </button>
                </div>
            </div>
        </>
    )
}
