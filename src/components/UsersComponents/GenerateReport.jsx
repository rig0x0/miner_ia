import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, ButtonGroup } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../../config/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseISO } from "date-fns";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const GenerateReport = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [errorFecha, setErrorFecha] = useState("");
  const [turno, setTurno] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [usuario, setUsuario] = useState(''); // si planeas usar usuario

  const [cargando, setCargando] = useState(false);
  const [urlPDF, setUrlPDF] = useState(null); // ✅ Estado para mostrar el PDF en un iframe

  const nombresEtapas = {
    CONCFE: "Concentrado de Fierro",
    CONCPB: "Concentrado de Plomo",
    CONCZN: "Concentrado de Zinc",
  };

  const getElements = async (endpoint) => {
    const { data } = await clienteAxios.get(endpoint);
    // ERROR CORREGIDO AQUÍ
    console.log(`Data from ${endpoint}:`, data);
    return data;
  };

  const obtenerTextoFecha = () => {
    if (!fechaInicio && !fechaFin) {
      return format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
    } else {
      const inicio = format(parseISO(fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es });
      const fin = format(parseISO(fechaFin), "d 'de' MMMM 'de' yyyy", { locale: es });
      return `${inicio} - ${fin}`;
    }
  };

  const validarFechas = (inicio, fin) => {
  if (inicio && fin && new Date(inicio) > new Date(fin)) {
    setFechaInicio(fin); // Corrige automáticamente la fecha de inicio
  }
};



  const generarPDF = (data) => {

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header styling
    doc.setFillColor(128, 128, 128) // Gray background for header
    doc.rect(0, 0, pageWidth, 30, "F")

    // Title and subtitle
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("PLANTA FLOTACIÓN JUANICIPIO", pageWidth / 2, 10, { align: "center" })
    doc.setFontSize(10)
    doc.text("Balance Metalúrgico Diario", pageWidth / 2, 18, { align: "center" })
    doc.text("Reporte de Producción", pageWidth / 2, 26, { align: "center" })

    // Date
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 30, pageWidth, 40, "F")
    doc.setFontSize(9)
    doc.text(obtenerTextoFecha(), pageWidth / 2, 37, { align: "center" });

    // RECUPERACIONES section header
    doc.setFillColor(200, 200, 200) // Light gray for section headers
    doc.rect(0, 40, pageWidth, 10, "F")
    doc.setFontSize(10)
    doc.text("RECUPERACIONES TOTALES", pageWidth / 2, 47, { align: "center" })

    // RECUPERACIONES tables
    const moliendaHeaders = [
      [
        { content: "Variable", styles: { fontStyle: "bold", halign: "center" } },
        { content: "Real", styles: { fontStyle: "bold", halign: "center" } },
      ],
    ]

    // MOLIENDA DIARIA
    autoTable(doc, {
      startY: 50,
      head: [[{ content: "RECUPERACIONES", colSpan: 2, styles: { halign: "center", fillColor: [220, 220, 220] } }]],
      body: [],
      theme: "grid",
      styles: { fontSize: 6 },
      headStyles: {
        textColor: [0, 0, 0], // Color del texto (blanco)
      },
      margin: { left: 10, right: 10 },
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      head: moliendaHeaders,
      body: data.reporte.recuperaciones.slice(0, 6).map(item => [item.elemento + " (%)", item.valor.toFixed(2)]),
      theme: 'grid',
      styles: { fontSize: 6 },
      margin: { left: 10, right: 10 },
      headStyles: {
        fillColor: [255, 255, 255], // Color de fondo (azul claro en este caso)
        lineWidth: 0.2,               // Grosor de la línea del borde
        textColor: [0, 0, 0], // Color del texto (blanco)
        fontStyle: 'bold', // Opcional: hace que el texto se vea más fuerte
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { halign: "center" },
      },
    });

    // RECUPERACIONES TOTALES section header
    doc.setFillColor(200, 200, 200)
    doc.rect(0, doc.lastAutoTable.finalY + 5, pageWidth, 10, "F")
    doc.setFontSize(10)
    doc.text("CONTENIDOS LIQUIDABLES", pageWidth / 2, doc.lastAutoTable.finalY + 12, { align: "center" })

    // CONTENIDOS DIARIAS
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [
        [{ content: "CONTENIDOS", colSpan: 2, styles: { halign: "center", fillColor: [220, 220, 220] } }],
      ],
      body: [],
      theme: "grid",
      styles: { fontSize: 6 },
      headStyles: {
        textColor: [0, 0, 0], // Color del texto (negro)
      },
      margin: { left: 10, right: 10 },
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      head: [
        [
          { content: "Metal", styles: { fontStyle: "bold", halign: "center" } },
          { content: "Real", styles: { fontStyle: "bold", halign: "center" } },
        ],
      ],
      body: data.reporte.contenidos.slice(0, 4).map(item => {
        const unidad = (item.elemento === "Ag" || item.elemento === "Au") ? " (kg)" : " (ton)";
        return [`${item.elemento}${unidad}`, item.valor.toFixed(2)];
      }),
      theme: 'grid',
      styles: { fontSize: 6 },
      margin: { left: 10, right: 10 },
      headStyles: {
        fillColor: [255, 255, 255], // Color de fondo (azul claro en este caso)
        lineWidth: 0.2,               // Grosor de la línea del borde
        textColor: [0, 0, 0], // Color del texto (blanco)
        fontStyle: 'bold', // Opcional: hace que el texto se vea más fuerte
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { halign: "center" },
      },
    });

    // CONTENIDOS LIQUIDABLES section header
    doc.setFillColor(200, 200, 200)
    doc.rect(0, doc.lastAutoTable.finalY + 5, pageWidth, 10, "F")
    doc.setFontSize(10)
    doc.text("CALIDAD DE LOS CONCENTRADOS", pageWidth / 2, doc.lastAutoTable.finalY + 12, { align: "center" })

    data.reporte.leyes.etapas.forEach((etapa, index) => {
      // Si es la primera tabla, deja espacio de 15, si no, solo 7
      const espacio = index === 0 ? 15 : 7;

      // Título centrado para cada etapa
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + espacio,
        head: [
          [{
            content: `LEY DE ${nombresEtapas[etapa.etapa]}`,
            colSpan: 2,
            styles: {
              halign: "center",
              fillColor: [220, 220, 220],
              fontStyle: "bold"
            }
          }],
        ],
        body: [], // cuerpo vacío para solo mostrar el título
        theme: "grid",
        styles: { fontSize: 7 },
        headStyles: {
          textColor: [0, 0, 0], // Color del texto (blanco)
        },
        margin: { left: 10, right: 10 },
      });

      // Tabla de datos de la etapa
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [
          [
            { content: "Metal", styles: { fontStyle: "bold", halign: "center" } },
            { content: "Real", styles: { fontStyle: "bold", halign: "center" } },
          ],
        ],
        body: etapa.valores.map(item => {
          const unidad = (item.elemento === "Ag" || item.elemento === "Au") ? " (gr/ton)" : " (%)";
          return [`${item.elemento}${unidad}`, item.valor.toFixed(2)];
        }),
        theme: 'grid',
        styles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
        headStyles: {
          fillColor: [255, 255, 255], // Color de fondo (azul claro en este caso)
          lineWidth: 0.2,               // Grosor de la línea del borde
          textColor: [0, 0, 0], // Color del texto (blanco)
          fontStyle: 'bold', // Opcional: hace que el texto se vea más fuerte
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { halign: "center" },
        },
      });
    });


    // ✅ Convertir el PDF a blob y generar una URL para previsualización
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setUrlPDF(pdfUrl); // ✅ Guardar URL en estado para mostrar en iframe
  };

  const generarReporte = async () => {
    setCargando(true);

    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('initial date', fechaInicio);
      if (fechaFin) params.append('final date', fechaFin);
      if (turno) params.append('shift', turno);
      if (laboratorio) params.append('laboratory', laboratorio);
      if (usuario) params.append('user', usuario);

      const endpoint = `/reporte/?${params.toString()}`;
      console.log("🔍 Generando desde:", endpoint);
      const data = await getElements(endpoint);

      if (data) {
        generarPDF(data);
      } else {
        console.error("No se recibieron datos del resumen.");
      }
    } catch (error) {
      console.error("Error al generar el reporte:", error);
    } finally {
      setCargando(false);
    }
  };



  const establecerRango = (rango) => {
    const hoy = new Date();
    const inicio = new Date(hoy);

    switch (rango) {
      case 'ultima-semana':
        inicio.setDate(hoy.getDate() - 7);
        break;
      case 'ultimo-mes':
        inicio.setMonth(hoy.getMonth() - 1);
        break;
      case 'ultimo-trimestre':
        inicio.setMonth(hoy.getMonth() - 3);
        break;
      case 'semana-actual':
        const diaSemana = hoy.getDay() || 7;
        inicio.setDate(hoy.getDate() - diaSemana + 1);
        break;
      case 'mes-actual':
        inicio.setDate(1);
        break;
      default:
        return;
    }

    setFechaInicio(format(inicio, 'yyyy-MM-dd'));
    setFechaFin(format(hoy, 'yyyy-MM-dd'));
  };

  return (
    <div className="container m-0">
      <h2 className="mb-3">Generación de Reportes</h2>

      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="mb-3">


              <Col md={4}>
                <Form.Group controlId="fechaInicio">
                  <Form.Label>Fecha de Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => {
                      const nuevaFecha = e.target.value;
                      setFechaInicio(nuevaFecha);
                      validarFechas(nuevaFecha, fechaFin);
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="fechaFin">
                  <Form.Label>Fecha de Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaFin}
                    onChange={(e) => {
                      const nuevaFecha = e.target.value;
                      setFechaFin(nuevaFecha);
                      validarFechas(fechaInicio, nuevaFecha);
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group>
              <Form.Label>Rangos Predefinidos</Form.Label>
              <div className="mb-3 ">
                <ButtonGroup className=''>
                  <Button variant="outline-info" onClick={() => establecerRango('ultima-semana')}>
                    Última semana
                  </Button>
                  <Button variant="outline-info" onClick={() => establecerRango('ultimo-mes')}>
                    Último mes
                  </Button>
                  <Button variant="outline-info" onClick={() => establecerRango('ultimo-trimestre')}>
                    Último trimestre
                  </Button>
                  <Button variant="outline-info" onClick={() => establecerRango('semana-actual')}>
                    Semana actual
                  </Button>
                  <Button variant="outline-info" onClick={() => establecerRango('mes-actual')}>
                    Mes actual
                  </Button>
                </ButtonGroup>
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Filtros Adicionales</Form.Label>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="tipoLab">
                    <Form.Label>Tipo de Laboratorio</Form.Label>
                    <Form.Select value={laboratorio} onChange={(e) => setLaboratorio(e.target.value)}>
                      <option value="">Selecciona...</option>
                      <option value="Laboratorio Conciliado">Laboratorio Conciliado</option>
                      <option value="Laboratorio Real">Laboratorio Real</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="tipoTurno">
                    <Form.Label>Turno</Form.Label>
                    <Form.Select value={turno} onChange={(e) => setTurno(e.target.value)}>
                      <option value="">Selecciona...</option>
                      <option value="1">Turno 1</option>
                      <option value="2">Turno 2</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="idEnsayista">
                    <Form.Label>Id del Ensayista</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Ingrese el id"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      min={1}
                    />
                  </Form.Group>
                </Col>

              </Row>
            </Form.Group>

            <div className="mt-4">
              <Button onClick={generarReporte} disabled={cargando}>
                {cargando ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {urlPDF && (
        <div className="mb-4">
          <h5>Previsualización del Reporte</h5>
          <iframe
            src={urlPDF}
            title="Reporte PDF"
            width="100%"
            height="600px"
            style={{ border: '1px solid #ccc' }}
          />
          <div className="mt-3">
            <a href={urlPDF} download={`reporte_produccion_${obtenerTextoFecha()}.pdf`}>
              <Button variant="success">Descargar PDF</Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
