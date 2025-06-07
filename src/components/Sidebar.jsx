import React, { useEffect } from "react";
import { Link } from "react-router";
import feather from "feather-icons";
import "../components/ComponentsStyles/Modal.css"; // Importa el archivo CSS si es necesario
import { useAuth } from "../context/AuthContext";


export const Sidebar = () => {

    const { logout, user } = useAuth();

    console.log(user)

    useEffect(() => {
        feather.replace();
    }, []);

    return (
        <>
            <nav className="navbar navbar-vertical navbar-expand-lg">
                <div className="collapse navbar-collapse" id="navbarVerticalCollapse">
                    <div className="navbar-vertical-content">
                        <ul className="navbar-nav flex-column" id="navbarVerticalNav">

                            {
                                user.rol.name === "Supervisor General" ? (
                                    <>
                                        <li className="nav-item">
                                            <div className="nav-item-wrapper item-tablero">
                                                <Link className="nav-link label-1" to={"/dashboard"}>
                                                    <div className="d-flex align-items-center">
                                                        <span className="nav-link-icon">
                                                            <i data-feather="home"></i>
                                                        </span>
                                                        <span className="nav-link-text">Tablero</span>
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
                                                        <span className="nav-link-text">Datos</span>
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
                                                                    <span className="nav-link-text">Proyecciones</span>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                        <li className="nav-item">
                                                            <Link className="nav-link" to={"/ensayes"}>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="nav-link-text">Ensayes</span>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                        <li className="nav-item">
                                                            <Link className="nav-link" to={"/generar-reporte"}>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="nav-link-text">Reportes</span>
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
                                                        <span className="nav-link-text">Tablero</span>
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
                                                        <span className="nav-link-text">Datos</span>
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
                                                                    <span className="nav-link-text">Proyecciones</span>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                        <li className="nav-item">
                                                            <Link className="nav-link" to={"/ensayes"}>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="nav-link-text">Ensayes</span>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                        <li className="nav-item">
                                                            <Link className="nav-link" to={"/generar-reporte"}>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="nav-link-text">Reportes</span>
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
                                                    <span className="nav-link-text">Datos</span>
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
                                                                <span className="nav-link-text">Proyecciones</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to={"/ensayes"}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">Ensayes</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to={"/generar-reporte"}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="nav-link-text">Reportes</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                ) : user.rol.name === "Ensayista" ? (
                                    <>
                                        <li className="nav-item">
                                            <div className="nav-item-wrapper item-tablero">
                                                <Link className="nav-link label-1" to={"/ensaye"}>
                                                    <div className="d-flex align-items-center">
                                                        <span className="nav-link-icon">
                                                            <i data-feather="home"></i>
                                                        </span>
                                                        <span className="nav-link-text">Tablero de Ensayista</span>
                                                    </div>
                                                </Link>
                                            </div>

                                        </li>
                                    </>
                                ) : null
                            }
                            <div className="nav-item">
                                <Link onClick={() => logout()} className="nav-link">
                                    <div className="d-flex align-items-center">
                                        <span className="nav-link-icon">
                                            <i data-feather="log-out"></i>
                                        </span>
                                        <span className="nav-link-text">Cerrar Sesión</span>
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