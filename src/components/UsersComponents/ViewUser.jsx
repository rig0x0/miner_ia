import React from 'react'
import { UsersTable } from './UsersTable'
import clienteAxios from '../../config/axios'
import { useQuery } from '@tanstack/react-query'

export const ViewUser = () => {

    const getUsers = async () => {
        const { data } = await clienteAxios.get('/user/')
        return data
    }

    const { data, error, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    console.log(data)
    if (isLoading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <>
            <div className="mb-4">
                <div className="row g-3 mb-0">
                    <div className="col-auto">
                        <h2 className="mb-0">Usuarios</h2>
                    </div>
                </div>
            </div>
            <ul class="nav nav-links mb-3 mb-lg-2 mx-n3">
                <li class="nav-item"><a class="nav-link active" aria-current="page" href="#"><span>Todos los usuarios </span><span class="text-body-tertiary fw-semibold">(5)</span></a></li>
                <li class="nav-item"><a class="nav-link" href="#"><span>Supervisores de Planta </span><span class="text-body-tertiary fw-semibold">(2)</span></a></li>
                <li class="nav-item"><a class="nav-link" href="#"><span>Supervisor </span><span class="text-body-tertiary fw-semibold">(1)</span></a></li>
                <li class="nav-item"><a class="nav-link" href="#"><span>Ensayistas </span><span class="text-body-tertiary fw-semibold">(2)</span></a></li>
            </ul>

            <div class="mb-4">
                <div class="d-flex flex-wrap gap-3">
                    <div class="search-box">
                        <form class="position-relative">
                            <input class="form-control search-input search" type="search" placeholder="Buscar Usuarios" aria-label="Search" />
                            <span class="fas fa-search search-box-icon"></span>

                        </form>
                    </div>
                    <div class="scrollbar overflow-hidden-y">
                        <div class="btn-group position-static" role="group">
                            <div class="btn-group position-static text-nowrap">
                                <button class="btn btn-phoenix-secondary px-7 flex-shrink-0" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent">
                                    Rol<span class="fas fa-angle-down ms-2"></span></button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">Action</a></li>
                                    <li><a class="dropdown-item" href="#">Another action</a></li>
                                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                                    <li>
                                        <hr class="dropdown-divider" />
                                    </li>
                                    <li><a class="dropdown-item" href="#">Separated link</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="ms-xxl-auto">
                        <button class="btn btn-primary"><span class="fas fa-plus me-2"></span>Registrar Nuevo Usuario</button>
                    </div>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div>
                <UsersTable
                    placeholder={"Buscar Usuario"}
                />
            </div>
        </>
    )
}
