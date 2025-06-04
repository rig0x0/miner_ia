import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import clienteAxios from "../../config/axios";

const elements = {
    pb: { name: "Plomo", symbol: "Pb", color: "#3366cc" },
    zn: { name: "Zinc", symbol: "Zn", color: "#dc3912" },
    au: { name: "Oro", symbol: "Au", color: "#ff9900" },
    ag: { name: "Plata", symbol: "Ag", color: "#109618" },
};

const fetchPredictions = async (element) => {
    const res = await clienteAxios.post(`/predicciones/pb_recovery_forecast/`);
    return res.data;
};

export const PrediccionInit = () => {
    const [selectedElement, setSelectedElement] = useState("pb");
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["predictions", selectedElement],
        queryFn: () => fetchPredictions(selectedElement),
    });

    const handleChange = (e) => setSelectedElement(e.target.value);

    const chartData = [];

    if (data) {
        const { historical_pb_recovery, predictions } = data;
        const lastDate = new Date(historical_pb_recovery[historical_pb_recovery.length - 1].date);

        // Agregar datos históricos
        historical_pb_recovery.forEach((item) => {
            chartData.push({
                date: new Date(item.date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
                historico: item.value,
                prediccion: null,
            });
        });

        // Agregar datos de predicción
        Object.entries(predictions).forEach(([key, val], i) => {
            const d = new Date(lastDate);
            d.setDate(d.getDate() + i + 1);
            chartData.push({
                date: d.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
                historico: null,
                prediccion: val,
            });
        });
    }

    const current = elements[selectedElement];
    const lastValue = data?.historical_pb_recovery.slice(-1)[0]?.value || 0;
    const avgPred = data ? Object.values(data.predictions).reduce((a, b) => a + b, 0) / 7 : 0;
    const trend = data?.trend?.toLowerCase();
    const trendDirection = trend === "alta" ? "up" : "down";

    return (
        <div className="container py-4">
            <h1 className="h3 fw-bold">Módulo de Proyecciones</h1>
            <p className="text-muted">Selecciona un elemento para ver las proyecciones basadas en IA</p>

            <div className="card my-3">
                <div className="card-body d-flex align-items-center gap-3">
                    <select className="form-select w-auto" value={selectedElement} onChange={handleChange}>
                        {Object.entries(elements).map(([key, el]) => (
                            <option key={key} value={key}>
                                {el.symbol} - {el.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                        onClick={refetch}
                        disabled={isLoading}
                    >
                        <span className={`spinner-border spinner-border-sm ${isLoading ? "" : "d-none"}`} />
                        Actualizar
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error.message}</div>}

            {isLoading ? (
                <div className="card p-4 text-center">
                    <div className="spinner-border text-primary" role="status" />
                    <span className="ms-2">Cargando predicciones...</span>
                </div>
            ) : data ? (
                <>
                    {/* Tarjetas resumen */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card p-3">
                                <div className="fw-bold">Recuperación Actual</div>
                                <div className="h4">{lastValue.toFixed(2)}%</div>
                                <small className="text-muted">{current.name}</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-3">
                                <div className="fw-bold">Promedio Predicción</div>
                                <div className="h4">{avgPred.toFixed(2)}%</div>
                                <small className={`text-${trend === "alta" ? "success" : "danger"}`}>
                                    {trend === "alta" ? "▲" : "▼"} {(avgPred - lastValue).toFixed(2)}%
                                </small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-3">
                                <div className="fw-bold">Tendencia</div>
                                <div className="h4 text-capitalize">{data.trend}</div>
                                <small className="text-muted">Próximos 7 días</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-3">
                                <div className="fw-bold">Predicción T+7</div>
                                <div className="h4">{data.predictions.t_plus_7.toFixed(2)}%</div>
                                <small className="text-muted">Día 7</small>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico */}
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">
                                Proyección de Recuperación - {current.name} ({current.symbol})
                            </h5>
                            <p className="card-subtitle mb-3 text-muted">
                                Datos históricos y predicciones para los próximos 7 días
                            </p>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={chartData}>
                                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                                    <Tooltip
                                        formatter={(v, name, props) =>
                                            [`${v?.toFixed(2)}%`, props.dataKey === "historico" ? "Histórico" : "Predicción"]
                                        }
                                        labelStyle={{ fontWeight: "bold" }}
                                    />
                                    <Legend />

                                    <ReferenceLine
                                        x={chartData.find((d) => d.prediccion !== null)?.date}
                                        stroke="gray"
                                        strokeDasharray="4 4"
                                        label={{ value: "Inicio Predicción", position: "insideTopRight", fontSize: 12 }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="historico"
                                        stroke={current.color}
                                        strokeWidth={2}
                                        name="Histórico"
                                        dot={{ r: 3 }}
                                        isAnimationActive={false}
                                        connectNulls={true}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="prediccion"
                                        stroke="#d62728"
                                        strokeWidth={2}
                                        name="Predicción"
                                        dot={{ r: 3 }}
                                        isAnimationActive={false}
                                        connectNulls={true}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col-6">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5 className="card-title mb-3">Predicciones Detalladas</h5>
                                    <h6 className="card-subtitle text-muted">Valores específicos para cada día</h6>
                                </div>
                                <div className="card-body">
                                    {Object.entries(data.predictions).map(([key, value]) => (
                                        <div key={key} className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-medium small">{key.replace("t_plus_", "Día +")}</span>
                                            <span className="badge bg-dark border">{value.toFixed(2)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-3">Análisis de Tendencia</h5>
                                    <h6 className="card-subtitle text-muted">Interpretación de los datos</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            {trendDirection === "up" ? (
                                                <>
                                                    <span className="fw-medium text-success"> <i class="fa-solid fa-arrow-trend-up"></i> Tendencia: {data.trend}</span>
                                                </>
                                            ) : (
                                                <>
                                                    
                                                    <span className="fw-medium text-danger"><i class="fa-solid fa-arrow-trend-down"></i> Tendencia: {data.trend}</span>
                                                </>
                                            )}

                                        </div>
                                        <p className="text-muted small mb-0">
                                            {trendDirection === "up"
                                                ? "Se espera una mejora en la recuperación durante los próximos días."
                                                : "Se prevé una disminución en la recuperación. Se recomienda revisar los procesos."}
                                        </p>
                                    </div>
                                    <div className="pt-3 border-top">
                                        <p className="text-muted small mb-0">
                                            Última actualización: {new Date().toLocaleString("es-ES")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                </>
            ) : null}
        </div>
    );
};
