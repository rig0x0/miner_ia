import React, { useEffect } from "react";
import { Link } from "react-router";
import feather from "feather-icons";
import "../components/ComponentsStyles/Modal.css";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export const Sidebar = () => {
    const { logout, user } = useAuth();
    const { t } = useTranslation();

    useEffect(() => {
        feather.replace();
    }, []);

    return (
        <>
            <nav className="navbar navbar-vertical navbar-expand-lg">
                <div className="collapse navbar-collapse" id="navbarVerticalCollapse">
                    <div className="navbar-vertical-content">
                        <ul className="navbar-nav flex-column" id="navbarVerticalNav">

                            {user.rol.name === "Supervisor General" ? (
                                <>
                                    <li className="nav-item">
                                        <div className="nav-item-wrapper item-tablero">
                                            <Link className="nav-link label-1" to={"/dashboard"}>
                                                <div className="d-flex align-items-center">
                                                    <span className="nav-link-icon">
                                                        <i data-feather="home"></i>
                                                    </span>
                                                    <span className="nav-link-text">
                                                        {t("sidebar.supervisorGeneral.dashboard")}
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    </li>

                                    <li className="nav-item">
                                        <div className="nav-item-wrapper">
                                            <a
                                                className="nav-link dropdown-indicator label-1"
                                                href="#nv-usuarios"
                                                role="button"
                                                data-bs-toggle="collapse"
                                                aria-expanded="true"
                                                aria-controls="nv-usuarios"
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="dropdown-indicator-icon-wrapper">
                                                        <span className="fas fa-caret-right dropdown-indicator-icon"></span>
                                                    </div>
                                                    <span className="nav-link-icon">
                                                        <i data-feather="settings"></i>
                                                    </span>
                                                    <span className="nav-link-text">
                                                        {t("sidebar.supervisorGeneral.users")}
                                                    </span>
                                                </div>
                                            </a>
                                            <div className="parent-wrapper label-1">
                                                <ul
                                                    className="nav collapse parent show"
                                                    data-bs-parent="#navbarVerticalUsuarios"
                                                    id="nv-usuarios"
                                                >
                                                    <li className="nav-item">
                                                        <Link to={"/usuarios"} className="nav-link">
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">
                                                                    {t("sidebar.supervisorGeneral.seeUsers")}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="nav-item">
                                        <div className="nav-item-wrapper">
                                            <a
                                                className="nav-link dropdown-indicator label-1"
                                                href="#nv-ensayes"
                                                role="button"
                                                data-bs-toggle="collapse"
                                                aria-expanded="false"
                                                aria-controls="nv-ensayes"
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="dropdown-indicator-icon-wrapper">
                                                        <span className="fas fa-caret-right dropdown-indicator-icon"></span>
                                                    </div>
                                                    <span className="nav-link-icon">
                                                        <span data-feather="pie-chart"></span>
                                                    </span>
                                                    <span className="nav-link-text">
                                                        {t("sidebar.supervisorGeneral.data")}
                                                    </span>
                                                </div>
                                            </a>
                                            <div className="parent-wrapper label-1">
                                                <ul
                                                    className="nav collapse parent show"
                                                    data-bs-parent="#navbarEnsayes"
                                                    id="nv-ensayes"
                                                >
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to={"/predicciones"}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">
                                                                    {t("sidebar.supervisorGeneral.proyecciones")}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to={"/ensayes"}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">
                                                                    {t("sidebar.supervisorGeneral.ensayes")}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to={"/generar-reporte"}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">
                                                                    {t("sidebar.supervisorGeneral.reportes")}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </>
                            ) : user.rol.name === "Supervisor de Planta" ? (
                                <>
                                    <li className="nav-item">
                                        <div className="nav-item-wrapper item-tablero">
                                            <Link className="nav-link label-1" to={"/dashboard"}>
                                                <div className="d-flex align-items-center">
                                                    <span className="nav-link-icon">
                                                        <i data-feather="home"></i>
                                                    </span>
                                                    <span className="nav-link-text">
                                                        {t("sidebar.supervisordePlanta.dashboard")}
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    </li>

                                    <li className="nav-item">
                                        <div className="nav-item-wrapper">
                                            <a
                                                className="nav-link dropdown-indicator label-1"
                                                href="#nv-ensayes"
                                                role="button"
                                                data-bs-toggle="collapse"
                                                aria-expanded="false"
                                                aria-controls="nv-ensayes"
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="dropdown-indicator-icon-wrapper">
                                                        <span className="fas fa-caret-right dropdown-indicator-icon"></span>
                                                    </div>
                                                    <span className="nav-link-icon">
                                                        <span data-feather="pie-chart"></span>
                                                    </span>
                                                    <span className="nav-link-text">
                                                        {t("sidebar.supervisordePlanta.data")}
                                                    </span>
                                                </div>
                                            </a>
                                            <div className="parent-wrapper label-1">
                                                <ul
                                                    className="nav collapse parent show"
                                                    data-bs-parent="#navbarEnsayes"
                                                    id="nv-ensayes"
                                                >
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to={"/predicciones"}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">
                                                                    {t("sidebar.supervisordePlanta.proyecciones")}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to={"/ensayes"}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">
                                                                    {t("sidebar.supervisordePlanta.ensayes")}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to={"/generar-reporte"}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">
                                                                    {t("sidebar.supervisordePlanta.reportes")}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </>
                            ) : user.rol.name === "Supervisor de Ensayista" ? (
                                <li className="nav-item">
                                    <div className="nav-item-wrapper">
                                        <a
                                            className="nav-link dropdown-indicator label-1"
                                            href="#nv-ensayes"
                                            role="button"
                                            data-bs-toggle="collapse"
                                            aria-expanded="false"
                                            aria-controls="nv-ensayes"
                                        >
                                            <div className="d-flex align-items-center">
                                                <div className="dropdown-indicator-icon-wrapper">
                                                    <span className="fas fa-caret-right dropdown-indicator-icon"></span>
                                                </div>
                                                <span className="nav-link-icon">
                                                    <span data-feather="pie-chart"></span>
                                                </span>
                                                <span className="nav-link-text">
                                                    {t("sidebar.supervisordeEnsayista.data")}
                                                </span>
                                            </div>
                                        </a>
                                        <div className="parent-wrapper label-1">
                                            <ul
                                                className="nav collapse parent show"
                                                data-bs-parent="#navbarEnsayes"
                                                id="nv-ensayes"
                                            >
                                                <li className="nav-item">
                                                    <Link className="nav-link" to={"/predicciones"}>
                                                        <div className="d-flex align-items-center">
                                                            <span className="nav-link-text">
                                                                {t("sidebar.supervisordeEnsayista.proyecciones")}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to={"/ensayes"}>
                                                        <div className="d-flex align-items-center">
                                                            <span className="nav-link-text">
                                                                {t("sidebar.supervisordeEnsayista.ensayes")}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to={"/generar-reporte"}>
                                                        <div className="d-flex align-items-center">
                                                            <span className="nav-link-text">
                                                                {t("sidebar.supervisordeEnsayista.reportes")}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            ) : user.rol.name === "Ensayista" ? (
                                <li className="nav-item">
                                    <div className="nav-item-wrapper item-tablero">
                                        <Link className="nav-link label-1" to={"/dashboard-ensayista"}>
                                            <div className="d-flex align-items-center">
                                                <span className="nav-link-icon">
                                                    <i data-feather="home"></i>
                                                </span>
                                                <span className="nav-link-text">
                                                    {t("sidebar.ensayista.dashboardEnsayista")}
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                </li>
                            ) : null}

                            <li className="nav-item">
                                <div className="nav-item-wrapper">
                                    <button className="nav-link label-1" onClick={logout}>
                                        <div className="d-flex align-items-center">
                                            <span className="nav-link-icon">
                                                <i data-feather="log-out"></i>
                                            </span>
                                            <span className="nav-link-text">
                                                {t("sidebar.logout")}
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};
