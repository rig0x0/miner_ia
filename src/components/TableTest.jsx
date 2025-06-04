import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from '@tanstack/react-table';
import React, { useState, useMemo } from 'react';

export const TableTest = ({ 
    data = [], 
    columns, 
    placeholder = "Buscar...", 
    addButton,
    filters = []
}) => {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState([]);

    const tableData = useMemo(() => Array.isArray(data) ? data : [], [data]);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            globalFilter,
            columnFilters,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
    });

    const handleFilterChange = (columnId, value) => {
        setColumnFilters(prev => 
            value === '' 
                ? prev.filter(f => f.id !== columnId)
                : [
                    ...prev.filter(f => f.id !== columnId),
                    { id: columnId, value }
                ]
        );
    };

    const getUniqueValues = (accessorKey) => {
        if (!tableData.length) return [];
        
        return [...new Set(
            tableData.map(item => {
                try {
                    const keys = accessorKey.split('.');
                    return keys.reduce((obj, key) => {
                        if (obj && typeof obj === 'object' && key in obj) {
                            return obj[key];
                        }
                        return undefined;
                    }, item);
                } catch {
                    return undefined;
                }
            }).filter(value => value !== undefined && value !== null)
        )].sort();
    };

    return (
        <div className="table-wrapper">
            {/* Header con filtros */}
            <div className="table-header">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 21L16.65 16.65" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input
                            className="search-input"
                            placeholder={placeholder}
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filters-container">
                    {filters.map(filter => {
                        const uniqueValues = getUniqueValues(filter.accessorKey);
                        const currentValue = columnFilters.find(f => f.id === filter.id)?.value || '';
                        
                        return (
                            <div key={filter.id} className="filter-group">
                                <label className="filter-label">{filter.label}</label>
                                {filter.type === 'select' ? (
                                    <select
                                        className="filter-select"
                                        value={currentValue}
                                        onChange={e => handleFilterChange(filter.id, e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        {uniqueValues.map(value => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={filter.type || 'text'}
                                        className="filter-input"
                                        value={currentValue}
                                        onChange={e => handleFilterChange(filter.id, e.target.value)}
                                        placeholder={filter.placeholder || `Filtrar por ${filter.label}`}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {addButton && (
                        <button
                            className="add-button"
                            onClick={addButton.onClick}
                        >
                            {addButton.icon && <span className={`button-icon ${addButton.icon.className}`} />}
                            {addButton.text}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        onClick={header.column.getToggleSortingHandler()}
                                        className={header.column.getIsSorted() ? 'sorted' : ''}
                                    >
                                        <div className="header-content">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            <span className="sort-icon">
                                                {{
                                                    asc: '↑',
                                                    desc: '↓'
                                                }[header.column.getIsSorted()] ?? '↕'}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="data-row">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr className="no-results-row">
                                <td colSpan={columns.length} className="no-results">
                                    <div className="no-results-content">
                                        <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 8V12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 16H12.01" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <p>No se encontraron resultados</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="pagination-container">
                <div className="pagination-info">
                    Mostrando página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </div>
                <div className="pagination-buttons">
                    <button
                        className="pagination-button first"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        «
                    </button>
                    <button
                        className="pagination-button prev"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </button>
                    <div className="page-numbers">
                        {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                            const pageIndex = table.getState().pagination.pageIndex;
                            let displayPage;
                            
                            if (table.getPageCount() <= 5) {
                                displayPage = i;
                            } else if (pageIndex <= 2) {
                                displayPage = i;
                            } else if (pageIndex >= table.getPageCount() - 3) {
                                displayPage = table.getPageCount() - 5 + i;
                            } else {
                                displayPage = pageIndex - 2 + i;
                            }

                            return (
                                <button
                                    key={displayPage}
                                    className={`page-number ${table.getState().pagination.pageIndex === displayPage ? 'active' : ''}`}
                                    onClick={() => table.setPageIndex(displayPage)}
                                >
                                    {displayPage + 1}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        className="pagination-button next"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </button>
                    <button
                        className="pagination-button last"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        »
                    </button>
                </div>
            </div>

            {/* Estilos CSS */}
            <style jsx>{`
                .table-wrapper {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #374151;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                    margin: 24px 0;
                }
                
                .table-header {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px;
                    background: #F9FAFB;
                    border-bottom: 1px solid #E5E7EB;
                }
                
                .search-container {
                    margin-bottom: 16px;
                    width: 100%;
                    max-width: 400px;
                }
                
                .search-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .search-icon {
                    position: absolute;
                    left: 12px;
                    width: 18px;
                    height: 18px;
                    pointer-events: none;
                }
                
                .search-input {
                    width: 100%;
                    padding: 10px 16px 10px 40px;
                    border: 1px solid #D1D5DB;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                    background: white;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: #3B82F6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .filters-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    align-items: center;
                }
                
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    min-width: 180px;
                }
                
                .filter-label {
                    font-size: 13px;
                    color: #6B7280;
                    margin-bottom: 4px;
                    font-weight: 500;
                }
                
                .filter-select, .filter-input {
                    padding: 8px 12px;
                    border: 1px solid #D1D5DB;
                    border-radius: 6px;
                    font-size: 14px;
                    background: white;
                    transition: all 0.2s;
                }
                
                .filter-select:focus, .filter-input:focus {
                    outline: none;
                    border-color: #3B82F6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .add-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: #3B82F6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-left: auto;
                }
                
                .add-button:hover {
                    background: #2563EB;
                }
                
                .add-button:disabled {
                    background: #9CA3AF;
                    cursor: not-allowed;
                }
                
                .button-icon {
                    display: inline-flex;
                    align-items: center;
                }
                
                .table-container {
                    width: 100%;
                    overflow-x: auto;
                }
                
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                
                .data-table th {
                    padding: 12px 16px;
                    text-align: left;
                    background: #F3F4F6;
                    font-weight: 600;
                    color: #4B5563;
                    border-bottom: 1px solid #E5E7EB;
                    position: sticky;
                    top: 0;
                    cursor: pointer;
                    user-select: none;
                }
                
                .data-table th:hover {
                    background: #E5E7EB;
                }
                
                .data-table th.sorted {
                    color: #1E40AF;
                    background: #EFF6FF;
                }
                
                .header-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .sort-icon {
                    margin-left: 8px;
                    font-size: 12px;
                    color: #9CA3AF;
                }
                
                .data-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #E5E7EB;
                    vertical-align: middle;
                }
                
                .data-row:hover {
                    background: #F9FAFB;
                }
                
                .no-results-row td {
                    padding: 40px;
                    text-align: center;
                }
                
                .no-results-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: #6B7280;
                }
                
                .no-results-icon {
                    width: 48px;
                    height: 48px;
                    margin-bottom: 16px;
                }
                
                .pagination-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-top: 1px solid #E5E7EB;
                    background: #F9FAFB;
                }
                
                .pagination-info {
                    font-size: 14px;
                    color: #6B7280;
                }
                
                .pagination-buttons {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                
                .pagination-button, .page-number {
                    padding: 8px 12px;
                    border: 1px solid #D1D5DB;
                    background: white;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .pagination-button:hover:not(:disabled), .page-number:hover:not(.active) {
                    background: #F3F4F6;
                }
                
                .pagination-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .page-numbers {
                    display: flex;
                    gap: 4px;
                }
                
                .page-number.active {
                    background: #3B82F6;
                    color: white;
                    border-color: #3B82F6;
                }
                
                @media (max-width: 768px) {
                    .table-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 16px;
                    }
                    
                    .search-container {
                        max-width: 100%;
                    }
                    
                    .filters-container {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .filter-group {
                        width: 100%;
                    }
                    
                    .add-button {
                        width: 100%;
                        justify-content: center;
                        margin-left: 0;
                    }
                    
                    .pagination-container {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .pagination-buttons {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};