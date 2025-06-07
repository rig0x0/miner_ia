import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Constantes y helpers específicos del PDF se quedan aquí.
const nombresEtapas = {
    CONCFE: "Concentrado de Fierro",
    CONCPB: "Concentrado de Plomo",
    CONCZN: "Concentrado de Zinc",
};

const obtenerTextoFecha = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) {
        return "Rango de fechas no definido";
    }
    const inicio = format(parseISO(fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es });
    const fin = format(parseISO(fechaFin), "d 'de' MMMM 'de' yyyy", { locale: es });
    return inicio === fin ? inicio : `${inicio} - ${fin}`;
};

// La función principal que se exporta. Es una función pura: recibe datos y devuelve un resultado.
export const generateAndPreviewPdf = (reportData, fechaInicio, fechaFin) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- COMIENZA LA LÓGICA DE CREACIÓN DEL PDF ---
    
    // Header styling
    doc.setFillColor(128, 128, 128);
    doc.rect(0, 0, pageWidth, 30, "F");

    // Title and subtitle
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("PLANTA FLOTACIÓN JUANICIPIO", pageWidth / 2, 10, { align: "center" });
    doc.setFontSize(10);
    doc.text("Balance Metalúrgico Diario", pageWidth / 2, 18, { align: "center" });
    doc.text("Reporte de Producción", pageWidth / 2, 26, { align: "center" });

    // Date
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 30, pageWidth, 40, "F");
    doc.setFontSize(9);
    doc.text(obtenerTextoFecha(fechaInicio, fechaFin), pageWidth / 2, 37, { align: "center" });
    
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
        body: reportData.reporte.recuperaciones.slice(0, 6).map(item => [item.elemento + " (%)", item.valor.toFixed(2)]),
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
        body: reportData.reporte.contenidos.slice(0, 4).map(item => {
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

    reportData.reporte.leyes.etapas.forEach((etapa, index) => {
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
    
    return pdfUrl
};