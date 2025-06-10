import React, { useEffect } from "react";
// 1. Importa NavLink desde react-router-dom
import { NavLink } from "react-router";
import feather from "feather-icons";
import "../components/ComponentsStyles/Modal.css"; // Asegúrate de tener la clase .active en este archivo
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export const Sidebar = () => {
    const { logout, user } = useAuth();
    const { t } = useTranslation();

    useEffect(() => {
        // Re-inicializa los íconos de Feather cuando el componente se monta
        feather.replace();
    }); // Se quita el array vacío para que se ejecute en cada render y los íconos se muestren bien al cambiar de rol

    // 2. Funciones para asignar clases si el enlace está activo
    const getActiveClass = ({ isActive }) =>
        isActive ? "nav-link label-1 active text-light" : "nav-link label-1";

    const getActiveSublinkClass = ({ isActive }) =>
        isActive ? "nav-link active text-white" : "nav-link";

    return (
        <>
            <nav className="navbar navbar-vertical navbar-expand-lg">
                <div className="collapse navbar-collapse" id="navbarVerticalCollapse">
                    <div className="navbar-vertical-content">
                        <ul className="navbar-nav flex-column" id="navbarVerticalNav">

                            {/* Menú para Supervisor General */}
                            {user.rol.name === "Supervisor General" ? (
                                <>
                                    <li className="nav-item">
                                        <div className="nav-item-wrapper item-tablero">
                                            <NavLink className={getActiveClass} to={"/dashboard"}>
                                                <div className="d-flex align-items-center">
                                                    <span className="nav-link-icon"><i data-feather="home"></i></span>
                                                    <span className="nav-link-text">{t("sidebar.supervisorGeneral.dashboard")}</span>
                                                </div>
                                            </NavLink>
                                        </div>
                                    </li>

                                    <li className="nav-item">
                                        <div className="nav-item-wrapper">
                                            <a className="nav-link dropdown-indicator label-1" href="#nv-usuarios" role="button" data-bs-toggle="collapse" aria-expanded="true" aria-controls="nv-usuarios">
                                                <div className="d-flex align-items-center">
                                                    <div className="dropdown-indicator-icon-wrapper"><span className="fas fa-caret-right dropdown-indicator-icon"></span></div>
                                                    <span className="nav-link-icon"><i data-feather="settings"></i></span>
                                                    <span className="nav-link-text">{t("sidebar.supervisorGeneral.users")}</span>
                                                </div>
                                            </a>
                                            <div className="parent-wrapper label-1">
                                                <ul className="nav collapse parent show" id="nv-usuarios">
                                                    <li className="nav-item">
                                                        <NavLink className={getActiveSublinkClass} to={"/usuarios"}>
                                                            <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisorGeneral.seeUsers")}</span></div>
                                                        </NavLink>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="nav-item">
                                        <div className="nav-item-wrapper">
                                            <a className="nav-link dropdown-indicator label-1" href="#nv-ensayes" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="nv-ensayes">
                                                <div className="d-flex align-items-center">
                                                    <div className="dropdown-indicator-icon-wrapper"><span className="fas fa-caret-right dropdown-indicator-icon"></span></div>
                                                    <span className="nav-link-icon"><span data-feather="pie-chart"></span></span>
                                                    <span className="nav-link-text">{t("sidebar.supervisorGeneral.data")}</span>
                                                </div>
                                            </a>
                                            <div className="parent-wrapper label-1">
                                                <ul className="nav collapse parent show" id="nv-ensayes">
                                                    <li className="nav-item">
                                                        <NavLink className={getActiveSublinkClass} to={"/predicciones"}>
                                                            <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisorGeneral.proyecciones")}</span></div>
                                                        </NavLink>
                                                    </li>
                                                    <li className="nav-item">
                                                        <NavLink className={getActiveSublinkClass} to={"/ensayes"}>
                                                            <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisorGeneral.ensayes")}</span></div>
                                                        </NavLink>
                                                    </li>
                                                    <li className="nav-item">
                                                        <NavLink className={getActiveSublinkClass} to={"/generar-reporte"}>
                                                            <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisorGeneral.reportes")}</span></div>
                                                        </NavLink>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </>
                            ) : /* Menú para Supervisor de Planta */
                                user.rol.name === "Supervisor de Planta" ? (
                                    <>
                                        <li className="nav-item">
                                            <div className="nav-item-wrapper item-tablero">
                                                <NavLink className={getActiveClass} to={"/dashboard"}>
                                                    <div className="d-flex align-items-center">
                                                        <span className="nav-link-icon"><i data-feather="home"></i></span>
                                                        <span className="nav-link-text">{t("sidebar.supervisordePlanta.dashboard")}</span>
                                                    </div>
                                                </NavLink>
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <div className="nav-item-wrapper">
                                                <a className="nav-link dropdown-indicator label-1" href="#nv-ensayes" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="nv-ensayes">
                                                    <div className="d-flex align-items-center">
                                                        <div className="dropdown-indicator-icon-wrapper"><span className="fas fa-caret-right dropdown-indicator-icon"></span></div>
                                                        <span className="nav-link-icon"><span data-feather="pie-chart"></span></span>
                                                        <span className="nav-link-text">{t("sidebar.supervisordePlanta.data")}</span>
                                                    </div>
                                                </a>
                                                <div className="parent-wrapper label-1">
                                                    <ul className="nav collapse parent show" id="nv-ensayes">
                                                        <li className="nav-item">
                                                            <NavLink className={getActiveSublinkClass} to={"/predicciones"}>
                                                                <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisordePlanta.proyecciones")}</span></div>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className={getActiveSublinkClass} to={"/ensayes"}>
                                                                <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisordePlanta.ensayes")}</span></div>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className={getActiveSublinkClass} to={"/generar-reporte"}>
                                                                <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisordePlanta.reportes")}</span></div>
                                                            </NavLink>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </li>
                                    </>
                                ) : /* Menú para Supervisor de Ensayista */
                                    user.rol.name === "Supervisor de Ensayista" ? (
                                        <li className="nav-item">
                                            <div className="nav-item-wrapper">
                                                <a className="nav-link dropdown-indicator label-1" href="#nv-ensayes" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="nv-ensayes">
                                                    <div className="d-flex align-items-center">
                                                        <div className="dropdown-indicator-icon-wrapper"><span className="fas fa-caret-right dropdown-indicator-icon"></span></div>
                                                        <span className="nav-link-icon"><span data-feather="pie-chart"></span></span>
                                                        <span className="nav-link-text">{t("sidebar.supervisordeEnsayista.data")}</span>
                                                    </div>
                                                </a>
                                                <div className="parent-wrapper label-1">
                                                    <ul className="nav collapse parent show" id="nv-ensayes">
                                                        {/* <li className="nav-item">
                                                            <NavLink className={getActiveSublinkClass} to={"/predicciones"}>
                                                                <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisordeEnsayista.proyecciones")}</span></div>
                                                            </NavLink>
                                                        </li> */}
                                                        <li className="nav-item">
                                                            <NavLink className={getActiveSublinkClass} to={"/ensayes"}>
                                                                <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisordeEnsayista.ensayes")}</span></div>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className={getActiveSublinkClass} to={"/generar-reporte"}>
                                                                <div className="d-flex align-items-center"><span className="nav-link-text">{t("sidebar.supervisordeEnsayista.reportes")}</span></div>
                                                            </NavLink>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </li>
                                    ) : /* Menú para Ensayista */
                                        user.rol.name === "Ensayista" ? (
                                            <li className="nav-item">
                                                <div className="nav-item-wrapper item-tablero">
                                                    <NavLink className={getActiveClass} to={"/dashboard-ensayista"}>
                                                        <div className="d-flex align-items-center">
                                                            <span className="nav-link-icon"><i data-feather="home"></i></span>
                                                            <span className="nav-link-text">{t("sidebar.ensayista.dashboardEnsayista")}</span>
                                                        </div>
                                                    </NavLink>
                                                </div>
                                            </li>
                                        ) : null}

                            {/* Botón de Logout */}
                            <li className="nav-item">
                                <div className="nav-item-wrapper">
                                    <button className="nav-link label-1" onClick={logout}>
                                        <div className="d-flex align-items-center">
                                            <span className="nav-link-icon"><i data-feather="log-out"></i></span>
                                            <span className="nav-link-text">{t("sidebar.logout")}</span>
                                        </div>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <style>
                {` /* Estilo para el enlace de navegación activo */
.nav-link.active {
  background-color: #6c757d; /* Cambia este color al que prefieras */
  color: #ffffff;
  border-left: 3px solid #000000; /* Un borde para resaltar */
}

/* Opcional: Estilo para el ícono dentro del enlace activo */
.nav-link.active .nav-link-icon {
  color: #ffffff; /* Cambia el color del ícono */
}`}
            </style>
        </>
    );
};