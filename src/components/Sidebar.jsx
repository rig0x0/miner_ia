import React from 'react'
import { Link } from 'react-router'

export const Sidebar = () => {
    return (
        <>
            <nav class="navbar navbar-vertical navbar-expand-lg">
                <div class="collapse navbar-collapse" id="navbarVerticalCollapse">
                    <div class="navbar-vertical-content">
                        <ul class="navbar-nav flex-column" id="navbarVerticalNav">
                            <li class="nav-item">
                                <a class="nav-link active" href="dashboard/project-management.html">
                                    <div class="d-flex align-items-center"><span class="nav-link-text">Dashboard</span>
                                    </div>
                                </a>
                            </li>
                            <li class="nav-item">

                                <div class="nav-item-wrapper"><a class="nav-link dropdown-indicator label-1" href="#nv-usuarios" role="button" data-bs-toggle="collapse" aria-expanded="true" aria-controls="nv-usuarios">
                                    <div class="d-flex align-items-center">
                                        <div class="dropdown-indicator-icon-wrapper"><span class="fas fa-caret-right dropdown-indicator-icon"></span></div><span class="nav-link-icon"><span data-feather="pie-chart"></span></span><span class="nav-link-text">Usuarios</span>
                                    </div>
                                </a>
                                    <div class="parent-wrapper label-1">
                                        <ul class="nav collapse parent show" data-bs-parent="#navbarVerticalUsuarios" id="nv-usuarios">
                                            <li class="nav-item">
                                                <Link to={'/usuarios'} class="nav-link">
                                                    <div class="d-flex align-items-center"><span class="nav-link-text">Ver Usuarios</span>
                                                    </div>
                                                </Link>

                                            </li>
                                            <li class="nav-item">
                                                <Link to={'/agregar-usuario'} class="nav-link" href="dashboard/project-management.html">
                                                    <div class="d-flex align-items-center"><span class="nav-link-text">Crear Usuario</span>
                                                    </div>
                                                </Link>

                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li class="nav-item">

                                <div class="nav-item-wrapper"><a class="nav-link dropdown-indicator label-1" href="#nv-ensayes" role="button" data-bs-toggle="collapse" aria-expanded="true" aria-controls="nv-ensayes">
                                    <div class="d-flex align-items-center">
                                        <div class="dropdown-indicator-icon-wrapper"><span class="fas fa-caret-right dropdown-indicator-icon"></span></div><span class="nav-link-icon"><span data-feather="pie-chart"></span></span><span class="nav-link-text">Ensayes</span>
                                    </div>
                                </a>
                                    <div class="parent-wrapper label-1">
                                        <ul class="nav collapse parent show" data-bs-parent="#navbarEnsayes" id="nv-ensayes">
                                            <li class="nav-item"><a class="nav-link" href="index.html">
                                                <div class="d-flex align-items-center"><span class="nav-link-text">E commerce</span>
                                                </div>
                                            </a>

                                            </li>
                                            <li class="nav-item"><a class="nav-link" href="dashboard/project-management.html">
                                                <div class="d-flex align-items-center"><span class="nav-link-text">Project management</span>
                                                </div>
                                            </a>

                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </li>

                        </ul>
                    </div>
                </div>
                <div class="navbar-vertical-footer">
                    <button class="btn navbar-vertical-toggle border-0 fw-semibold w-100 white-space-nowrap d-flex align-items-center"><span class="uil uil-left-arrow-to-left fs-8"></span><span class="uil uil-arrow-from-right fs-8"></span><span class="navbar-vertical-footer-text ms-2">Collapsed View</span></button>
                </div>
            </nav>
        </>
    )
}
