import React from 'react'
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import '../components/ComponentsStyles/Modal.css';


export const CardComponent = ({ elementos }) => {

    const nombres = {
        Au: "Oro",
        Ag: "Plata",
        Pb: "Plomo",
        Zn: "Zinc",
        Fe: "Hierro",
        Cu: "Cobre",
        Insoluble: "Insoluble",
        Cd: "Cadmio",
        Ar: "Argón"
    }

    const colores = {
        Au: "gold",
        Ag: "silver",
        Pb: "#6e6e6e",   // gris oscuro
        Zn: "#b0c4de",   // azul claro
        Fe: "#b22222",   // rojo óxido
        Cu: "#b87333",   // cobrizo
        Insoluble: "#808080",
        Cd: "#e3cf57",   // dorado pálido
        Ar: "#87ceeb"    // azul cielo
    }

    const renderRow = (label, value, valor, unidad = '%') => (
        <tr>
            <td className='text-start'>{label}</td>
            <td style={{ textAlign: 'center' }}>
                {value.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>{unidad}</span>
            </td>
            <td>
                <span
                    style={{
                        display: 'inline-block',
                        minWidth: '60px',
                        borderRadius: '4px',
                        backgroundColor: valor > 0 ? '#28a745' : '#dc3545',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                    }}
                >
                    {valor.toFixed(2)} {"%"}
                </span>
            </td>
        </tr>
    );

    return (
        <Row xs={1} md={3} className="g-4">
            {elementos.map((item, idx) => (
                <Col key={idx}>
                    <Card>
                        <Card.Body className='pb-0'>
                            <Card.Title style={{ fontSize: '19px' }}>
                                <span style={{ color: colores[item.elemento] || "black", fontWeight: "bold" }}>
                                    {item.elemento}
                                </span>
                                {" - "}
                                <span className="card-subtitle-text">
  {nombres[item.elemento] || "Desconocido"}
</span>
                            </Card.Title>
                            <Card.Text style={{ fontSize: '10px' }}>
                                <Table className="text-center">
                                    <thead>
                                        <tr>
                                            <th className='text-start'>Parámetro</th>
                                            <th>Valor</th>
                                            <th>vs Ayer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderRow('Recuperación', item.recuperacion, item.comparativa_recuperacion, item.unidad?.recuperacion)}
                                        {renderRow('Ley', item.ley, item.comparativa_ley, item.unidad?.ley)}
                                        {renderRow('Contenido', item.contenido, item.comparativa_contenido, item.unidad?.contenido)}
                                    </tbody>
                                </Table>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    )
}