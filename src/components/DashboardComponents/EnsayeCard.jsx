import { AlertCircle, Calendar, CheckCircle, Clock, FlaskConical, SeparatorHorizontal, User } from 'lucide-react'
import React from 'react'
import { Badge, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import { Link } from 'react-router'
import '../ComponentsStyles/EnsayeLink.css'
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook
export const EnsayeCard = ({ ensaye }) => {
    const { t, i18n } = useTranslation();

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatNumber = (num) => {
        return num?.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    return (
        <>
            {
                ensaye && ensaye.id ? (
                    <Link to={`/detalles-ensaye/${ensaye.id}`} className="ensaye-link">
                        <Card className="ensaye-card w-100 border border-success bg-success bg-opacity-10">
                            <CardHeader className="pb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <CardTitle className="d-flex align-items-center mb-0">
                                        <Clock size={20} className="me-2" />
                                        {t("tablero.cardEnsayeporDia.turno")} {ensaye.turno}
                                    </CardTitle>
                                    <Badge bg="success" text="light" className="d-flex align-items-center">
                                        <CheckCircle size={14} className="me-1" />
                                        {t("ensayeCard.completado")}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardBody>
                                {/* Información general */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-2">
                                        <p className="text-muted mb-1"><small>{t("ensayeCard.idEnsaye")}</small></p>
                                        <p className="fw-semibold">#{ensaye.id}</p>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <p className="text-muted mb-1"><small>{t("ensayesVista.fecha")}</small></p>
                                        <p className="fw-semibold d-flex align-items-center">
                                            <Calendar size={16} className="me-1" />
                                            {formatDate(ensaye.fecha)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-muted mb-1"><small>{t("ensayesVista.tipo")}</small></p>
                                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary">
                                        {ensaye.tipo_ensaye}
                                    </Badge>
                                </div>

                                <hr />

                                {/* Datos del producto */}
                                <div className="mb-3">
                                    <h5 className="fw-semibold text-dark d-flex align-items-center">
                                        <FlaskConical size={16} className="me-2" />
                                        {t("ensayeCard.datos")}
                                    </h5>
                                    <div className="bg-gray p-3 border rounded">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text">{t("ensayesVista.molienda")}:</span>
                                            <span className="fw-medium">{formatNumber(ensaye.producto?.molienda_humeda)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text">{t("ensayesVista.humedad")}:</span>
                                            <span className="fw-medium">{formatNumber(ensaye.producto?.humedad)}%</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text">{t("ensayesVista.cabeza")}:</span>
                                            <span className="fw-medium">{formatNumber(ensaye.producto?.cabeza_general)}</span>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                {/* Ensayista */}
                                <div>
                                    <h5 className="fw-semibold text-dark d-flex align-items-center">
                                        <User size={16} className="me-2" />
                                        {t("viewUsers.rolEnsayista")}
                                    </h5>
                                    <div className="bg-gray p-3 border rounded">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-medium">{ensaye.user.name}</span>
                                            <Badge bg={ensaye.user.active ? "success" : "secondary"} className="text-uppercase small">
                                                {ensaye.user.active ? t("ensayeCard.activo") : t("ensayeCard.Inactivo")}
                                            </Badge>
                                        </div>
                                        <p className="text mb-1">{ensaye.user.email}</p>
                                        <p className="text mb-0">{t("ensayeCard.rol")}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>
                ) : (
                    <Card className="w-100 border border-warning bg-warning bg-opacity-10">
                        <CardHeader className="pb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <CardTitle className="d-flex align-items-center mb-0">
                                    <Clock size={20} className="me-2" />
                                    {t("tablero.cardEnsayeporDia.turno")} {ensaye.turno}
                                </CardTitle>
                                <Badge bg="warning" text="dark" className="d-flex align-items-center">
                                    <AlertCircle size={14} className="me-1" />
                                    {t("tablero.cardEnsayeporDia.estatusPendiente")}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardBody className="text-center py-4">
                            <FlaskConical size={48} className="text-warning mb-3" />
                            <p className="fw-medium text-warning">{t("tablero.cardEnsayeporDia.pendienteDescripcion")}</p>
                            <p className="text-muted small">{t("tablero.cardEnsayeporDia.infoExtra")}</p>
                        </CardBody>
                    </Card>
                )
            }
        </>
    )
}
