import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Row, Col, ButtonGroup, Stack, Alert } from 'react-bootstrap';
import { useMutation, useQuery } from '@tanstack/react-query';
import clienteAxios from '../../config/axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook

export const GenerateReport = () => {
    const { t, i18n } = useTranslation();
    // --- ESTADOS DEL COMPONENTE ---
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [turno, setTurno] = useState('');
    const [laboratorio, setLaboratorio] = useState('');
    const [usuario, setUsuario] = useState('');
    const [urlPDF, setUrlPDF] = useState(null);
    const [activeRange, setActiveRange] = useState('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [formError, setFormError] = useState(null); // Para errores generales del formulario/servidor
    const [fieldErrors, setFieldErrors] = useState({}); // Para errores específicos de cada campo
    const previewRef = useRef(null);

    // --- OBTENER DATOS PARA EL SELECT DE ENSAYISTAS ---
    const { data: ensayistas, isLoading: isLoadingEnsayistas } = useQuery({
        queryKey: ['ensayistas'],
        queryFn: async () => {
            const { data } = await clienteAxios.get('/user/ensayistas');
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
    
    // --- CONSTANTES Y FUNCIONES HELPERS ---
    const nombresEtapas = {
        CONCFE: "Concentrado de Fierro",
        CONCPB: "Concentrado de Plomo",
        CONCZN: "Concentrado de Zinc",
    };

    const obtenerTextoFecha = () => {
        if (!fechaInicio || !fechaFin) return "Rango de fechas no definido";
        const inicio = format(parseISO(fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es });
        const fin = format(parseISO(fechaFin), "d 'de' MMMM 'de' yyyy", { locale: es });
        return inicio === fin ? inicio : `${inicio} al ${fin}`;
    };

    // --- LÓGICA DE GENERACIÓN DE PDF ---
    const generarPDF = (data) => {
        const elementosExcluidos = ["Insoluble", "Cd", "Ar"];
        const dataFiltrada = {
            ...data,
            reporte: {
                ...data.reporte,
                recuperaciones: data.reporte.recuperaciones.filter(item => !elementosExcluidos.includes(item.elemento)),
                contenidos: data.reporte.contenidos.filter(item => !elementosExcluidos.includes(item.elemento)),
            }
        };

        const formatValue = (value) => !isNaN(parseFloat(value)) ? parseFloat(value).toFixed(2) : 'N/A';
        const getErrorMessage = (errorData) => typeof errorData === 'string' ? errorData : 'Datos no disponibles.';
        
        const generateTableBody = (items, formatFn) => {
            if (Array.isArray(items) && items.length > 0) return items.map(formatFn);
            return [[{ content: `Error: ${getErrorMessage(items)}`, colSpan: 2, styles: { textColor: [217, 30, 24], fontStyle: 'italic', halign: 'center' } }]];
        };

        const recuperacionesBody = generateTableBody(dataFiltrada.reporte.recuperaciones, item => [`${item.elemento} (%)`, formatValue(item.valor)]);
        const contenidosBody = generateTableBody(dataFiltrada.reporte.contenidos, item => {
            const unidad = (item.elemento === "Ag" || item.elemento === "Au") ? " (kg)" : " (ton)";
            return [`${item.elemento}${unidad}`, formatValue(item.valor)];
        });

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const colorPrincipal = '#003366';
        const colorSecundario = '#5a6673';
        const colorTextoTitulos = '#FFFFFF';
        
        doc.setFillColor(colorPrincipal);
        doc.rect(0, 0, pageWidth, 22, "F");
        doc.setFontSize(14); doc.setTextColor(colorTextoTitulos);
        doc.text("PLANTA FLOTACIÓN XXXXX", pageWidth / 2, 10, { align: "center" });
        doc.setFontSize(10);
        doc.text("Balance Metalúrgico - Reporte de Producción", pageWidth / 2, 17, { align: "center" });
        doc.setFontSize(9); doc.setTextColor(colorSecundario);
        doc.text(`Periodo: ${obtenerTextoFecha()}`, 14, 28);
        doc.text(`Generado: ${format(new Date(), "dd-MM-yyyy HH:mm")}`, pageWidth - 14, 28, { align: 'right' });

        let startY = 34;

        const filterDetails = [];
        if (turno) filterDetails.push(['Turno:', turno]);
        if (laboratorio) filterDetails.push(['Laboratorio:', laboratorio]);
        if (usuario && ensayistas) {
            const ensayistaSel = ensayistas.find(e => e.id.toString() === usuario);
            if (ensayistaSel) filterDetails.push(['Ensayista:', ensayistaSel.name]);
        }

        if (filterDetails.length > 0) {
            autoTable(doc, {
                startY: startY, body: filterDetails, theme: 'plain',
                styles: { fontSize: 7, cellPadding: 0.5 },
                columnStyles: { 0: { fontStyle: 'bold', halign: 'right', cellWidth: 30 }, 1: { cellWidth: 'auto'} },
            });
            startY = doc.lastAutoTable.finalY + 3;
        }

        const headStyles = { fillColor: colorSecundario, textColor: colorTextoTitulos, fontStyle: 'bold', halign: 'center' };
        const subHeadStyles = { fillColor: '#f8f9fa', textColor: '#000000', fontStyle: 'bold' };

        autoTable(doc, { startY, head: [[{ content: "RECUPERACIONES TOTALES", colSpan: 2, styles: headStyles }], [{ content: "Elemento", styles: subHeadStyles }, { content: "Valor", styles: { ...subHeadStyles, halign: 'right' } }]], body: recuperacionesBody, theme: 'grid', styles: { fontSize: 8 }, margin: { left: 10, right: 10 }, columnStyles: { 1: { halign: 'right' } } });
        startY = doc.lastAutoTable.finalY + 7;
        autoTable(doc, { startY, head: [[{ content: "CONTENIDOS LIQUIDABLES", colSpan: 2, styles: headStyles }], [{ content: "Elemento", styles: subHeadStyles }, { content: "Valor", styles: { ...subHeadStyles, halign: 'right' } }]], body: contenidosBody, theme: 'grid', styles: { fontSize: 8 }, margin: { left: 10, right: 10 }, columnStyles: { 1: { halign: 'right' } } });
        startY = doc.lastAutoTable.finalY + 10;
        
        doc.setFontSize(12); doc.setTextColor(colorPrincipal);
        doc.text("CALIDAD DE LOS CONCENTRADOS", pageWidth / 2, startY, { align: 'center' });
        startY += 7;

        if (Array.isArray(data.reporte.leyes?.etapas)) {
            data.reporte.leyes.etapas.forEach((etapa) => {
                const etapaBody = generateTableBody(etapa.valores, item => {
                    const unidad = (item.elemento === "Ag" || item.elemento === "Au") ? " (gr/ton)" : " (%)";
                    return [`${item.elemento}${unidad}`, formatValue(item.valor)];
                });
                autoTable(doc, { startY, head: [[{ content: `LEY DE ${nombresEtapas[etapa.etapa] || etapa.etapa}`, colSpan: 2, styles: { ...headStyles, fillColor: colorPrincipal } }], [{ content: "Metal", styles: subHeadStyles }, { content: "Real", styles: { ...subHeadStyles, halign: 'right' } }]], body: etapaBody, theme: 'grid', styles: { fontSize: 8 }, columnStyles: { 1: { halign: 'right' } }, margin: { left: 10, right: 10 } });
                startY = doc.lastAutoTable.finalY + 7;
            });
        }
        
        const pdfBlob = doc.output('blob');
        setUrlPDF(URL.createObjectURL(pdfBlob));
    };
    
    // --- MANEJO DE API ---
    const { mutate: runGenerateReport, isPending: cargandoDatos } = useMutation({
        mutationFn: async (params) => {
            const { data } = await clienteAxios.get(`/reporte/?${params.toString()}`);
            return data;
        },
        onSuccess: (data) => {
            setFormError(null);
            setUrlPDF(null);
            if (data.reporte && data.reporte.detail) {
                setFormError(data.reporte.detail);
                return;
            }
            if (!data || !data.reporte) {
                setFormError("La respuesta del servidor no tiene el formato esperado.");
                return;
            }
            setIsGeneratingPdf(true);
            setTimeout(() => {
                generarPDF(data);
                setIsGeneratingPdf(false);
                toast.success(t("reportes.alerta"));
                setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }, 50);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.detail || error.message || "No se pudo generar el reporte.";
            setFormError(errorMessage);
            setUrlPDF(null);
        },
    });

    // --- MANEJADORES DE EVENTOS ---
    const handleGenerarReporte = () => {
        const newErrors = {};
        if (!fechaInicio) newErrors.fechaInicio = t("reportes.errorFechaInicio");
        if (!fechaFin) newErrors.fechaFin = t("reportes.errorFechaFin");

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            setFormError(null);
            return;
        }
        setFieldErrors({});
        const params = new URLSearchParams({
            'initial date': fechaInicio, 'final date': fechaFin,
            ...(turno && { shift: turno }),
            ...(laboratorio && { laboratory: laboratorio }),
            ...(usuario && { user: usuario }),
        });
        runGenerateReport(params);
    };

    const establecerRango = (rango) => {
        setActiveRange(rango);
        setFieldErrors({}); setFormError(null);
        const hoy = new Date();
        let inicio = new Date(hoy);
        if (!rango) { setFechaInicio(''); setFechaFin(''); return; }
        switch (rango) {
            case 'ultima-semana': inicio.setDate(hoy.getDate() - 6); break;
            case 'ultimo-mes': inicio.setMonth(hoy.getMonth() - 1); break;
            case 'ultimo-trimestre': inicio.setMonth(hoy.getMonth() - 3); break;
            case 'semana-actual': inicio.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1)); break;
            case 'mes-actual': inicio.setDate(1); break;
            default: return;
        }
        setFechaInicio(format(inicio, 'yyyy-MM-dd'));
        setFechaFin(format(hoy, 'yyyy-MM-dd'));
    };
    
    const limpiarYRestablecer = () => {
        setTurno('');
        setLaboratorio('');
        setUsuario('');
        setUrlPDF(null);
        setFormError(null);
        setFieldErrors({});
        establecerRango('');
    };
    
    useEffect(() => {
        establecerRango('');
    }, []);

    const isUIBlocked = cargandoDatos || isGeneratingPdf;

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div className="container py-4">
            <h1 className="h3 fw-bold">{t("reportes.titulo")}</h1>
            <p className="text-muted">{t("reportes.descripcion")}</p>

            <fieldset disabled={isUIBlocked} style={{ opacity: isUIBlocked ? 0.7 : 1, transition: 'opacity 0.3s' }}>
                <Card className="p-3 shadow-sm mb-4">
                    <Row className="mb-3">
                        <Col md={6} lg={4}>
                            <Form.Group controlId="fechaInicio">
                                <Form.Label>{t("reportes.fechaInicio")}</Form.Label>
                                <Form.Control type="date" value={fechaInicio} max={fechaFin || format(new Date(), 'yyyy-MM-dd')}
                                    onChange={(e) => { setFechaInicio(e.target.value); setActiveRange(''); setFieldErrors({}); }}
                                    isInvalid={!!fieldErrors.fechaInicio}
                                />
                                <Form.Control.Feedback type="invalid">{fieldErrors.fechaInicio}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                            <Form.Group controlId="fechaFin">
                                <Form.Label>{t("reportes.fechaFin")}</Form.Label>
                                <Form.Control type="date" value={fechaFin} min={fechaInicio} max={format(new Date(), 'yyyy-MM-dd')}
                                    onChange={(e) => { setFechaFin(e.target.value); setActiveRange(''); setFieldErrors({}); }}
                                    isInvalid={!!fieldErrors.fechaFin}
                                />
                                <Form.Control.Feedback type="invalid">{fieldErrors.fechaFin}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Form.Group>
                        <Form.Label>{t("reportes.rangos")}</Form.Label>
                        <div className="mb-3"><ButtonGroup className="flex-wrap">
                            {[
                                { label: t("reportes.semanaActual"), value: 'semana-actual' }, { label: t("reportes.mesActual"), value: 'mes-actual' },
                                { label: t("reportes.ultimaSemana"), value: 'ultima-semana' }, { label: t("reportes.ultimoMes"), value: 'ultimo-mes' },
                                { label: t("reportes.ultimoTrimestre"), value: 'ultimo-trimestre' },
                            ].map(rango => (
                                <Button key={rango.value} variant="outline-info" active={activeRange === rango.value} onClick={() => establecerRango(rango.value)} className="mb-1">{rango.label}</Button>
                            ))}
                        </ButtonGroup></div>
                    </Form.Group>

                    <Row>
                        <Col md={4}><Form.Group controlId="tipoLab" className="mb-3">
                            <Form.Label>{t("reportes.laboratorio")}</Form.Label>
                            <Form.Select value={laboratorio} onChange={(e) => setLaboratorio(e.target.value)}>
                                <option value="">{t("reportes.todos")}</option><option value="Laboratorio Conciliado">Laboratorio Conciliado</option><option value="Laboratorio Real">Laboratorio Real</option>
                            </Form.Select>
                        </Form.Group></Col>
                        <Col md={4}><Form.Group controlId="tipoTurno" className="mb-3">
                            <Form.Label>{t("reportes.turno")}</Form.Label>
                            <Form.Select value={turno} onChange={(e) => setTurno(e.target.value)}>
                                <option value="">{t("reportes.todos")}</option><option value="1">Turno 1</option><option value="2">Turno 2</option>
                            </Form.Select>
                        </Form.Group></Col>
                        <Col md={4}><Form.Group controlId="idEnsayista" className="mb-3">
                            <Form.Label>{t("reportes.ensayista")}</Form.Label>
                            <Form.Select value={usuario} onChange={(e) => setUsuario(e.target.value)} disabled={isLoadingEnsayistas}>
                                <option value="">{t("reportes.todos")}</option>
                                {isLoadingEnsayistas && <option disabled>Cargando...</option>}
                                {ensayistas?.map(ensayista => (<option key={ensayista.id} value={ensayista.id}>{ensayista.name}</option>))}
                            </Form.Select>
                        </Form.Group></Col>
                    </Row>
                </Card>
            </fieldset>

            {formError && (
                <Alert variant="danger" className="mt-4">{formError}</Alert>
            )}

            <Stack direction="horizontal" gap={3} className="mt-4 mb-5">
                <Button onClick={handleGenerarReporte} disabled={isUIBlocked} size="sm">
                    {cargandoDatos ? 'Cargando datos...' : isGeneratingPdf ? 'Generando PDF...' : t("reportes.generarReporte")}
                    {isUIBlocked && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
                </Button>
                <Button variant="outline-info" onClick={limpiarYRestablecer} disabled={isUIBlocked}>{t("reportes.restablecer")}</Button>
            </Stack>
            
            {!formError && urlPDF && (
                <div ref={previewRef}>
                    <Card className="shadow">
                        <Card.Header as="h5" className="bg-light">{t("reportes.previsualizar")}</Card.Header>
                        <Card.Body>
                            <iframe src={urlPDF} title="Reporte PDF" width="100%" height="800px" style={{ border: '1px solid #dee2e6', borderRadius: '4px' }}/>
                            <div className="mt-3 text-center">
                                <Button as="a" href={urlPDF} download={`Reporte_Produccion_${fechaInicio}_a_${fechaFin}.pdf`} variant="success" size="lg">
                                    <i className="fas fa-download me-2"></i> {t("reportes.descargar")}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}
            
            <ToastContainer position="top-right" theme="colored" autoClose={4000} />
        </div>
    );
};