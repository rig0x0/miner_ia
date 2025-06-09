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
import { CustomSpinner } from "../CustomSpinner";
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook




const fetchPredictions = async (element) => {
    const res = await clienteAxios.post(`/predicciones/forecast/${element}`);
    console.log(res)
    return res.data;
};

export const PrediccionInit = () => {
     const { t, i18n } = useTranslation();
    const [selectedElement, setSelectedElement] = useState("Pb");
    const queryClient = useQueryClient();

    const elements = {
    Pb: { name: t("tablero.cardGrafico.grafica.elemento.plomo"), symbol: "Pb", color: "#3366cc" },
    Zn: { name: t("tablero.cardGrafico.grafica.elemento.zinc"), symbol: "Zn", color: "#0b090a" },
    Au: { name: t("tablero.cardGrafico.grafica.elemento.oro"), symbol: "Au", color: "#ff9900" },
    Ag: { name: t("tablero.cardGrafico.grafica.elemento.plata"), symbol: "Ag", color: "#109618" },
};

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["predictions", selectedElement],
        queryFn: () => fetchPredictions(selectedElement),
    });

    const handleChange = (e) => setSelectedElement(e.target.value);

    const chartData = [];

    if (data && !data.isError) {
        const { historical_data, predictions } = data;
        const lastDate = new Date(historical_data[historical_data.length - 1].date);

        // Agregar datos históricos
        historical_data.forEach((item) => {
            chartData.push({
                date: new Date(item.date + 'T00:00:00').toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
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
    const lastValue = data?.historical_data?.slice(-1)[0]?.value || 0;
    const avgPred = data?.predictions ? Object.values(data.predictions).reduce((a, b) => a + b, 0) / 7 : 0;
    const trend = data?.trend?.toLowerCase();
    const trendDirection = trend === "alta" ? "up" : "down";

    return (
        <div className="container py-4">
            <h1 className="h3 fw-bold">{t("proyecciones.titulo")}</h1>
            <p className="text-muted">{t("proyecciones.descripcion")}</p>

            <div className="card my-3 shadow-sm">
                <div className="card-body d-flex align-items-center gap-3">
                    <select className="form-select w-auto" value={selectedElement} onChange={handleChange}>
                        {Object.entries(elements).map(([key, el]) => (
                            <option key={key} value={key}>
                                {el.symbol} - {el.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
                        onClick={refetch}
                        disabled={isLoading}
                    >
                        <span className={`spinner-border spinner-border-sm ${isLoading ? "" : "d-none"}`} />
                        {t("proyecciones.actualizar")}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error.message}</div>}


            {isLoading ? (
                <CustomSpinner />
            ) : data ? (
                <>

                    {data.isError ? <div className="alert alert-danger">{data.detail}</div> : (
                        <>
                            {/* Tarjetas resumen */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <div className="card p-3 shadow-sm">
                                        <div className="fw-bold">{t("proyecciones.recuperacion")}</div>
                                        <div className="h4">{lastValue.toFixed(2)}%</div>
                                        <small className="text">{current.name}</small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card p-3 shadow-sm">
                                        <div className="fw-bold">{t("proyecciones.prediccion")}</div>
                                        <div className="h4">{avgPred.toFixed(2)}%</div>
                                        <small className={`text-${trend === "alta" ? "success" : "danger"}`}>
                                            {trend === "alta" ? "▲" : "▼"} {(avgPred - lastValue).toFixed(2)}%
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card p-3 shadow-sm">
                                        <div className="fw-bold">{t("proyecciones.tendencia")}</div>
                                        <div className="h4 text-capitalize">{data.trend}</div>
                                        <small className="text-muted">{t("proyecciones.tiempo")}</small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card p-3 shadow-sm">
                                        <div className="fw-bold">{t("proyecciones.prediccionT7")}</div>
                                        <div className="h4">{data.predictions.t_plus_7.toFixed(2)}%</div>
                                        <small className="text-muted">{t("proyecciones.dia")}</small>
                                    </div>
                                </div>
                            </div>

                            {/* Gráfico */}
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {t("proyecciones.tituloGrafica")} - {current.name} ({current.symbol})
                                    </h5>
                                    <p className="card-subtitle mb-3 text-muted">
                                        {t("proyecciones.descripcionGrafica")}
                                    </p>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={chartData}>
                                            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                                            <YAxis domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                                            <Tooltip
                                                formatter={(v, name, props) =>
                                                    [`${v?.toFixed(2)}%`, props.dataKey === "historico" ? t("proyecciones.historico") : t("proyecciones.prediccionLabel")]
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
                                                name={t("proyecciones.historico")}
                                                dot={{ r: 3 }}
                                                isAnimationActive={false}
                                                connectNulls={true}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="prediccion"
                                                stroke="#d62728"
                                                strokeWidth={2}
                                                name={t("proyecciones.prediccionLabel")}
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
                                    <div className="card mb-4 shadow-sm">
                                        <div className="card-header">
                                            <h5 className="card-title mb-3">{t("proyecciones.tituloDetalles")}</h5>
                                            <h6 className="card-subtitle text-muted">{t("proyecciones.descripcionDetalles")}</h6>
                                        </div>
                                        <div className="card-body">
                                            {Object.entries(data.predictions).map(([key, value]) => (
                                                <div key={key} className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-medium small">{key.replace("t_plus_", t("proyecciones.day")+ " +")}</span>
                                                    <span className="badge bg-dark border">{value.toFixed(2)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="card shadow-sm">
                                        <div className="card-header">
                                            <h5 className="card-title mb-3">{t("proyecciones.tituloTendencia")}</h5>
                                            <h6 className="card-subtitle text-muted">{t("proyecciones.descripcionTendencia")}</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    {trendDirection === "up" ? (
                                                        <>
                                                            <span className="fw-medium text-success"> <i class="fa-solid fa-arrow-trend-up"></i> {t("proyecciones.tendencia")}: {data.trend}</span>
                                                        </>
                                                    ) : (
                                                        <>

                                                            <span className="fw-medium text-danger"><i class="fa-solid fa-arrow-trend-down"></i> {t("proyecciones.tendencia")}: {data.trend}</span>
                                                        </>
                                                    )}

                                                </div>
                                                <p className="text small mb-0">
                                                    {trendDirection === "up"
                                                        ? t("proyecciones.tendenciaUp")
                                                        : t("proyecciones.tendenciaDown")}
                                                </p>
                                            </div>
                                            <div className="pt-3 border-top">
                                                <p className="text small mb-0">
                                                    {t("proyecciones.actualizacion")} {new Date().toLocaleString("es-ES")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            ) : null}
        </div>
    );
};
