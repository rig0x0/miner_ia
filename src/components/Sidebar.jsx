import React, { useEffect } from "react";
import { Link } from "react-router";
import feather from "feather-icons";
import "../components/ComponentsStyles/Modal.css"; // Importa el archivo CSS si es necesario


export const Sidebar = () => {
    useEffect(() => {
        feather.replace();
    }, []);

    return (
        <>
            <nav className="navbar navbar-vertical navbar-expand-lg">
                <div className="collapse navbar-collapse" id="navbarVerticalCollapse">
                    <div className="navbar-vertical-content">
                        <ul className="navbar-nav flex-column" id="navbarVerticalNav">
                            <li className="nav-item">
                                <div className="nav-item-wrapper item-tablero">
                                    <a className="nav-link label-1" href="/dashboard">
                                        <div className="d-flex align-items-center">
                                            <span className="nav-link-icon">
                                                <i data-feather="home"></i>
                                            </span>
                                            <span className="nav-link-text">Tablero</span>
                                        </div>
                                    </a>
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
                                            <span className="nav-link-text">Usuarios</span>
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
                                                        <span className="nav-link-text">Ver Usuarios</span>
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
                                            <span className="nav-link-text">Ensayes</span>
                                        </div>
                                    </a>
                                    <div className="parent-wrapper label-1">
                                        <ul
                                            className="nav collapse parent show"
                                            data-bs-parent="#navbarEnsayes"
                                            id="nv-ensayes"
                                        >
                                        
                                            <li className="nav-item">
                                                <a className="nav-link" href="/proyecciones">
                                                    <div className="d-flex align-items-center">
                                                        <span className="nav-link-text">Proyecciones</span>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" href="/generar-reporte">
                                                    <div className="d-flex align-items-center">
                                                        <span className="nav-link-text">Crear Reporte</span>
                                                    </div>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </li>

                            <div className="nav-item">
                                <Link to={"/login"} className="nav-link">
                                    <div className="d-flex align-items-center">
                                        <span className="nav-link-icon">
                                            <i data-feather="log-out"></i>
                                        </span>
                                        <span className="nav-link-text">Salir</span>
                                    </div>
                                </Link>
                            </div>
                        </ul>
                    </div>
                </div>
                
            </nav>
        </>
    );
};
