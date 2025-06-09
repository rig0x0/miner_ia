import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import clienteAxios from '../../config/axios';
import { ResumeComponent } from './ResumeComponent';
import { CustomSpinner } from '../CustomSpinner';
import { GraficasDashboard } from './GraficasDashboard';
import { TableEnsayes } from '../TableEnsayes';
import { EnsayeCard } from './EnsayeCard';
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook
import { enUS, es } from 'date-fns/locale';
import { format } from 'date-fns';

export const SupervisorDashboard = () => {
    const { t, i18n } = useTranslation();

    const [date, setDate] = useState()
    const currentLocale = i18n.language === 'es' ? es : enUS;

    const getElements = async () => {
        const response = await clienteAxios.get("/dashboard/");
        console.log(response)
        return response.data;
    };

    const { data: dashboard, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getElements,
        select: data => {
            const ensayes = data.ensayes_dia || [];

            const tieneTurno1 = ensayes.some(e => e.turno === 1);
            const tieneTurno2 = ensayes.some(e => e.turno === 2);

            const completados = [...ensayes];

            if (!tieneTurno1) {
                completados.push({ turno: 1, estado: t("tablero.cardEnsayesporDia.estatusPendiente") });
            }

            if (!tieneTurno2) {
                completados.push({ turno: 2, estado: t("tablero.cardEnsayesporDia.estatusPendiente") });
            }

            // Ordenar por turno (1 primero, luego 2)
            const ordenados = completados.sort((a, b) => a.turno - b.turno);

            return {
                ...data,
                ensayes_dia: ordenados
            };
        }
    });

   const fechaFormateada = format(
           new Date(),
           t("detailsEnsaye.dateFormat"),
           { locale: currentLocale }
       );

    // useEffect(() => {
    //     if (dashboard) {
    //         convertData(); // tu función que quieres ejecutar una vez se obtienen los datos
    //     }
    // }, [dashboard]);

    if (isLoading) return <CustomSpinner />
    console.log(dashboard)
    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-6">
                    <h1 className="h2 fw-bold">{t("tablero.titulo")}</h1>
                    <p className="text-muted">{t("tablero.descripcionTitulo")}</p>
                </div>
                <div className="col-6 d-flex justify-content-end">

                </div>
            </div>

            <div className="card my-3 shadow-sm ">
                <div className="card-body ">
                    <h4 className='fw-bold'>{t("tablero.cardEnsayeporDia.titulo")}</h4>
                    <p className=''>
                        {fechaFormateada}
                    </p>
                    <div>
                        <div className="row">
                            {
                                dashboard.ensayes_dia.map(e => (
                                    <>
                                        <div className="col-6">
                                            <EnsayeCard
                                                ensaye={e}
                                            />
                                        </div>

                                    </>

                                ))
                            }
                        </div>

                    </div>

                </div>
            </div>

            <div className="card my-3 shadow-sm ">
                <div className="card-body ">
                    <h4 className='fw-bold'>{t("tablero.cardResumenEnsaye.titulo")}</h4>
                    <div>
                        {
                            dashboard.resumen.isError ? (
                                <>
                                    <p>{dashboard.resumen.detail}</p>
                                </>
                            ) : (
                                <ResumeComponent
                                    dataResume={dashboard?.resumen}
                                />
                            )
                        }

                    </div>

                </div>
            </div>

            <div className="card my-3 shadow-sm ">
                <div className="card-body ">
                    <h4 className='fw-bold'>{t("tablero.cardGrafico.titulo")}</h4>
                    <div>
                        {
                            dashboard.recuperaciones.isError ? (
                                <>
                                    <p>{dashboard.recuperaciones.detail}</p>
                                </>
                            ) : (
                                <GraficasDashboard
                                    contenidos={dashboard?.contenidos}
                                    leyes={dashboard?.leyes}
                                    recuperaciones={dashboard?.recuperaciones}
                                />
                            )
                        }

                    </div>

                </div>
            </div>
        </div>
    );
};