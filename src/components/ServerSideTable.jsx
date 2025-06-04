import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

export const ServerSideTable = ({
  columns,
  fetchData,
  queryKey,
  initialPageSize = 5,
  maxPageSize = 50,
  filtersConfig = [],
  placeholder = "Buscar...",
  enableDateFilter = true,
  enableGlobalSearch = true,
  addButton
}) => {
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Estado para filtros
  const [filters, setFilters] = useState({
    globalSearch: '',
    dateRange: { startDate: null, endDate: null },
    ...Object.fromEntries(filtersConfig.map(filter => [filter.id, '']))
  });

  // Construir parámetros de consulta
  const buildQueryParams = () => {
    const params = {
      skip: currentPage,
      limit: pageSize
    };

    if (enableGlobalSearch && filters.globalSearch) {
      params.search = filters.globalSearch;
    }

    if (enableDateFilter && filters.dateRange.startDate && filters.dateRange.endDate) {
      params.init_date = filters.dateRange.startDate.toISOString().split('T')[0];
      params.final_date = filters.dateRange.endDate.toISOString().split('T')[0];
    }

    filtersConfig.forEach(filter => {
      if (filters[filter.id]) {
        params[filter.id] = filters[filter.id];
      }
    });

    return params;
  };

  // Consulta principal
  const { data: apiResponse, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [queryKey, currentPage, pageSize, filters],
    queryFn: () => fetchData(buildQueryParams()),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000
  });

  // Extraer datos de la respuesta
  const tableData = apiResponse?.data?.data || [];
  const totalCount = apiResponse?.data?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / pageSize);

  // Manejadores de eventos
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
    setCurrentPage(0);
  };

  const handleDateChange = (dates) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        startDate: dates?.[0] || null,
        endDate: dates?.[1] || null
      }
    }));
    setCurrentPage(0);
  };

  // Función para obtener el valor de una propiedad anidada
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div className="server-side-table">
      {/* Overlay de carga */}
      {isFetching && (
        <div className="fetching-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Header con filtros */}
      <div className="table-header">
        {enableGlobalSearch && (
          <div className="search-box">
            <input
              type="text"
              placeholder={placeholder}
              value={filters.globalSearch}
              onChange={(e) => handleFilterChange('globalSearch', e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        {enableDateFilter && (
          <div className="date-filter">
            <DatePicker
              selectsRange
              startDate={filters.dateRange.startDate}
              endDate={filters.dateRange.endDate}
              onChange={handleDateChange}
              placeholderText="Selecciona rango de fechas"
              disabled={isLoading}
              className='form-control'
            />
          </div>
        )}

        {filtersConfig.map(filter => (
          <div key={filter.id} className="filter-control">
            <label>{filter.label}</label>
            {filter.type === 'select' ? (
              <select
                value={filters[filter.id]}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                disabled={isLoading}
              >
                <option value="">Todos</option>
                {filter.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={filter.type || 'text'}
                value={filters[filter.id]}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                placeholder={filter.placeholder}
                disabled={isLoading}
              />
            )}
          </div>
        ))}

        {addButton && (
          <button
            className="add-button"
            onClick={addButton.onClick}
            disabled={isLoading}
          >
            {addButton.icon && <span className="button-icon">{addButton.icon}</span>}
            {addButton.text}
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="table-container">
        {isError ? (
          <div className="error-message">
            Error al cargar los datos: {error.message}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map(column => (
                  <th key={column.accessorKey || column.id}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map(column => {
                      if (column.cell) {
                        return (
                          <td key={`${rowIndex}-${column.accessorKey || column.id}`}>
                            {column.cell({ row: { original: row } })}
                          </td>
                        );
                      }

                      const value = column.accessorKey 
                        ? getNestedValue(row, column.accessorKey)
                        : null;

                      return (
                        <td key={`${rowIndex}-${column.accessorKey || column.id}`}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="no-data">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      <div className="pagination-controls">
        <div className="page-size-selector">
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            disabled={isLoading}
          >
            {[1, 5, 10, 20, 30, 50].filter(size => size <= maxPageSize).map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="page-info">
          Página {currentPage + 1} de {pageCount} ({totalCount} registros)
        </div>

        <div className="page-buttons">
          <button
            onClick={() => handlePageChange(0)}
            disabled={currentPage === 0 || isLoading}
          >
            «
          </button>
          <button
            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0 || isLoading}
          >
            ‹
          </button>
          
          {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
            let pageNum;
            if (pageCount <= 5) {
              pageNum = i;
            } else if (currentPage <= 2) {
              pageNum = i;
            } else if (currentPage >= pageCount - 3) {
              pageNum = pageCount - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                className={currentPage === pageNum ? 'active' : ''}
                onClick={() => handlePageChange(pageNum)}
                disabled={isLoading}
              >
                {pageNum + 1}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(Math.min(pageCount - 1, currentPage + 1))}
            disabled={currentPage >= pageCount - 1 || isLoading}
          >
            ›
          </button>
          <button
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={currentPage >= pageCount - 1 || isLoading}
          >
            »
          </button>
        </div>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .server-side-table {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #374151;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          position: relative;
        }
        
        .fetching-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3B82F6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .table-header {
          padding: 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }
        
        .search-box {
          flex: 1;
          min-width: 200px;
        }
        
        .search-box input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
        }
        
        .date-filter {
          min-width: 250px;
        }
        
        .filter-control {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 180px;
        }
        
        .filter-control label {
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .filter-control select,
        .filter-control input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
        }
        
        .add-button {
          padding: 8px 16px;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .add-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button-icon {
          display: inline-flex;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          padding: 12px 16px;
          text-align: left;
          background: #f1f5f9;
          font-weight: 600;
          color: #334155;
        }
        
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        tr:hover {
          background: #f8fafc;
        }
        
        .no-data {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }
        
        .error-message {
          padding: 16px;
          color: #dc2626;
          background: #fee2e2;
          border-radius: 4px;
          margin: 16px;
        }
        
        .pagination-controls {
          padding: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        
        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .page-size-selector select {
          padding: 6px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
        }
        
        .page-info {
          color: #64748b;
          font-size: 0.875rem;
        }
        
        .page-buttons {
          display: flex;
          gap: 4px;
        }
        
        .page-buttons button {
          padding: 6px 12px;
          border: 1px solid #cbd5e1;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .page-buttons button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .page-buttons button.active {
          background: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }
        
        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .pagination-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .page-buttons {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};