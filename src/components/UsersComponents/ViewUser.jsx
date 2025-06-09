import React, { useEffect, useState } from 'react'
import clienteAxios from '../../config/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Table } from '../Table'
import { CustomModal } from '../CustomModal'
import { useForm } from 'react-hook-form'
import { throwNotification } from '../../helpers/ThrowNotification'
import { ToastContainer } from 'react-toastify'
import { Spinner } from 'reactstrap'
import { ServerSideTable } from '../ServerSideTable'
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook

export const ViewUser = () => {
    const { t, i18n } = useTranslation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm();

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        formState: { errors: errorsEdit },
        reset: resetEdit,
        watch: watchEdit,
        unregister
    } = useForm();

    // Obtenemos los valores de las contraseñas
    const password = watch('password');
    const new_password = watchEdit('new_password');

    const queryClient = useQueryClient();

    const [userSelected, setUserSelected] = useState({
        id: 0,
        email: '',
        name: '',
        rol: ''
    })

    const [modalOpen, setModalOpen] = useState(false)
    const [modalEdit, setModalEdit] = useState(false)
    const [modalDelete, setModalDelete] = useState(false)
    const [viewChangePassword, setViewChangePassword] = useState(false)

    const toggleChangePassword = () => {
        setViewChangePassword(!viewChangePassword)
    }

    const toggleModal = () => {
        reset()
        setModalOpen(!modalOpen)
    }

    const toggleModalEdit = () => {
        // resetEdit()
        setViewChangePassword(false)
        setModalEdit(!modalEdit)
    }

    const toggleModalDelete = () => setModalDelete(!modalDelete)

    const openEditModal = (user) => {
        setModalEdit(true)
        setUserSelected({
            id: user.id,
            email: user.email,
            name: user.name,
            rol: user.rol.id
        })
    }

    const openDeleteModal = (user) => {
        setModalDelete(true)
        setUserSelected({
            id: user.id,
            email: user.email,
            name: user.name,
            rol: user.rol.name
        })
    }

    const registerUserMutation = useMutation({
        mutationFn: async (newUser) => {
            const res = await clienteAxios.post('/user', newUser, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return res.data;
        },
        onSuccess: (data) => {
            console.log('Usuario creado', data);
            // Acción posterior a la creación del usuario.
            throwNotification(t("modificar.exito"), "success");

            // Invalidar la query de los usuarios para forzar la recarga
            queryClient.invalidateQueries(["users"]);

            //Resetear formulario de registros
            reset()

            //Cerrar el modal de registro
            toggleModal()
        },
        onError: (error) => {
            console.log(error)
            // Manejo de error si la solicitud falla.
            throwNotification(t("modificar.error") + error.response?.data?.detail, "error");
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: async (editUser) => {
            const res = await clienteAxios.put(`/user/${editUser.id}`, editUser, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return res.data;
        },
        onSuccess: (data) => {
            console.log('Usuario Editado', data);
            // Acción posterior a la creación del usuario.
            throwNotification(t('modificar.exitoUpdate', { id: data.id }), "success");

            // Invalidar la query de los usuarios para forzar la recarga
            queryClient.invalidateQueries(["users"]);

            //Resetear formulario de registros
            resetEdit()

            //Cerrar el modal de registro
            toggleModalEdit()
        },
        onError: (error) => {
            console.log(error)
            // // Manejo de error si la solicitud falla.
            throwNotification(t("modificar.errorUpdate") + error.response?.data?.detail, "error");
        },
    })

    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await clienteAxios.delete(`/user/${userId}`);
            return res.data;
        },
        onSuccess: (data) => {
            console.log('Usuario Eliminado', data);
            // Acción posterior a la creación del usuario.
            throwNotification(t("modificar.exitoDelete"), "success");

            // Invalidar la query de los usuarios para forzar la recarga
            queryClient.invalidateQueries(["users"]);

            toggleModalDelete()
        },
        onError: (error) => {
            console.error('Error al crear el usuario', error);

            throwNotification(t("modificar.errorDelete") + error.response?.data?.detail, "error");
            // Manejo de error si la solicitud falla.
        },
    });

    // const getUsers = async () => {
    //     const { data } = await clienteAxios.get('/user/')
    //     console.log(data)
    //     return data
    // }

    const fetchUsers = async (params) => {
        const queryParams = new URLSearchParams();

        // Solo agregar parámetros definidos
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const response = await clienteAxios(`/user/?${queryParams.toString()}`);
        console.log(response)
        if (!response.status === 200) {
            throw new Error('Error al cargar los usuarios');
        }
        return response;
    }

    // const { data: users, error, isLoading } = useQuery({
    //     queryKey: ["users"],
    //     queryFn: getUsers,
    // });

    const onSubmit = (data) => {
        // console.log(data)
        const newUser = {
            email: data.username,
            name: data.name,
            rol_id: data.rol_id,
            password: data.password,
            active: true
        }

        registerUserMutation.mutate(newUser)
    }

    const onSubmitEdit = (data) => {
        console.log(data)
        if (data.confirm_password) {
            const editUser = {
                id: userSelected.id,
                email: data.username,
                name: data.name,
                rol_id: data.rol_id,
                new_password: data.new_password,
                confirm_password: data.confirm_password,
            }
            updateUserMutation.mutate(editUser)
        } else {
            const editUser = {
                id: userSelected.id,
                email: data.username,
                name: data.name,
                rol_id: data.rol_id,
            }
            updateUserMutation.mutate(editUser)
        }
    }

    const deleteUser = () => {
        deleteUserMutation.mutate(userSelected.id)
    }

    const button = {
        text: t("viewUsers.botonRegistrar"),
        // No necesitas className aquí, ya que ServerSideTable tiene su propio estilo
        onClick: () => {
            setModalOpen(true)
        },
        // ¡LA CORRECCIÓN! Pasa el ícono como un elemento JSX renderizable
        icon: <i className="fas fa-plus me-2" />
    }

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id'
        },
        {
            header: t("viewUsers.modal.correo"),
            accessorKey: 'email'
        },
        {
            header: t("viewUsers.modal.nombre"),
            accessorKey: 'name'
        },
        {
            id: 'rol',
            header: t("viewUsers.modal.labelRol"),
            accessorKey: 'rol',
            cell: ({ row }) => {
                return (
                    <>
                        <p>{row.original.rol.name}</p>
                    </>
                )
            },
        },
        {
            id: 'acciones',
            header: t("viewUsers.actions"),
            cell: ({ row }) => {
                return (
                    <>
                        <div className="">
                            <td class="d-flex justify-content-center white-space-nowrap text-end pe-0">
                                <div class="btn-reveal-trigger position-static">
                                    <button class="btn fondoBtnVista dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent">
                                        <span class="fas fa-ellipsis-h fs-9"></span>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-end py-2">
                                        <button
                                            class="dropdown-item"
                                            onClick={() => openEditModal(row.original)}
                                        >
                                            <i class="fas fa-pen"></i> {t("viewUsers.editar")}
                                        </button>
                                        <div class="dropdown-divider">
                                        </div>
                                        <button
                                            class="dropdown-item text-danger"
                                            onClick={() => openDeleteModal(row.original)}
                                        >
                                            <i class="fa-solid fa-trash"></i> {t("viewUsers.eliminar")}
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </div>

                    </>

                )
            },
        },
    ]

    const filtersConfig = [
        {
            id: 'user_id',
            label: t("viewUsers.labelId"),
            type: 'text',
            placeholder: t("viewUsers.placeholderId")
        },
        {
            id: 'name',
            label: t("viewUsers.labelNombre"),
            type: 'text',
            placeholder: t("viewUsers.placeholderNombre")
        },
        {
            id: 'rol',
            label: t("viewUsers.labelRol"),
            type: 'select',
            options: [
                { value: 1, label: t("viewUsers.rolSupervisorGeneral") },
                { value: 2, label: t("viewUsers.rolSupervisordePlanta") },
                { value: 3, label: t("viewUsers.rolSupervisordeEnsayista") },
                { value: 4, label: t("viewUsers.rolEnsayista") },
            ]
        }
    ];


    useEffect(() => {
        if (userSelected.email != '') {
            console.log('entre')
            resetEdit({
                username: userSelected.email,
                name: userSelected.name,
                rol_id: userSelected.rol
            });
        }
    }, [userSelected, resetEdit]);

    return (
        <>
            {/* Register User */}
            <CustomModal isOpen={modalOpen} toggle={toggleModal} modalTitle={t("viewUsers.modal.titleRegistrar")} >
                <form onSubmit={handleSubmit(onSubmit)}>

                    <div class="mb-3">
                        <label className='form-label'>{t("viewUsers.modal.correo")}</label>
                        <input
                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                            type="email"
                            placeholder="name@example.com"
                            {...register('username', {
                                required: t("viewUsers.modal.advertenciaCorreo"),
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: t("viewUsers.modal.errorCorreo"),
                                },
                            })}
                        />
                        {errors.username && (
                            <div className="invalid-feedback">
                                {errors.username.message}
                            </div>
                        )}
                    </div>

                    <div class="mb-3">
                        <label className='form-label'>{t("viewUsers.modal.nombre")}</label>
                        <input
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            type="text"
                            placeholder={t("viewUsers.modal.modalEditar.placeholderNombre")}
                            {...register('name', {
                                required: t("viewUsers.modal.advertenciaNombre"),
                            })}
                        />
                        {errors.name && (
                            <div className="invalid-feedback">
                                {errors.name.message}
                            </div>
                        )}
                    </div>
                    {/* Select */}
                    <div className="mb-3">
                        <label className='form-label'>{t("viewUsers.modal.labelRol")}</label>
                        <select
                            className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                            aria-label="Floating label select example"
                            {...register('rol_id', {
                                required: t("viewUsers.modal.advertenciaRol"),
                            })}
                        >
                            <option value={null}>{t("viewUsers.labelRol")}</option>
                            <option value="1">{t("viewUsers.rolSupervisorGeneral")}</option>
                            <option value="2">{t("viewUsers.rolSupervisordePlanta")}</option>
                            <option value="3">{t("viewUsers.rolSupervisordeEnsayista")}</option>
                            <option value="4">{t("viewUsers.rolEnsayista")}</option>
                        </select>
                        {errors.role && (
                            <div className="invalid-feedback">
                                {errors.role.message}
                            </div>
                        )}
                    </div>
                    <div class="mb-3">
                        <label className='form-label'>{t("viewUsers.modal.modalRegistrar.contraseña")}</label>
                        <input
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            type="password"
                            placeholder="Password"
                            {...register('password', {
                                required: t("viewUsers.modal.modalRegistrar.advertenciaContraseña"),
                                minLength: {
                                    value: 6,
                                    message: t("viewUsers.modal.modalRegistrar.errorContraseña"),
                                },
                            })}
                        />
                        {errors.password && (
                            <div className="invalid-feedback">
                                {errors.password.message}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className='form-label'>{t("viewUsers.modal.modalRegistrar.confirmar")}</label>
                        <input
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            type="password"
                            placeholder={t("viewUsers.modal.modalRegistrar.placeholderConfirmar")}
                            {...register('confirmPassword', {
                                required: t("viewUsers.modal.modalRegistrar.advertenciaConfirmar"),
                                validate: value => value === password || t("viewUsers.modal.modalRegistrar.errorConfirmar"),
                            })}
                        />
                        {errors.confirmPassword && (
                            <div className="invalid-feedback">
                                {errors.confirmPassword.message}
                            </div>
                        )}
                    </div>

                    <div className='row'>
                        <div className="col-6">
                            <button type="button" className="btn btn-secondary w-100" onClick={toggleModal}>{t("viewUsers.modal.modalRegistrar.cancelar")}</button>
                        </div>
                        <div className="col-6">
                            <button type="submit" className="btn btn-primary w-100">
                                <span className='fas fa-plus me-2'></span>{t("viewUsers.modal.modalRegistrar.registrar")}
                            </button>
                        </div>

                    </div>

                </form>
            </CustomModal>

            {/* Edit User */}
            <CustomModal isOpen={modalEdit} toggle={toggleModalEdit} modalTitle={t("viewUsers.modal.modalEditar.tituloEditar")}>
                <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
                    <div class="mb-3">
                        <label className="form-label">{t("viewUsers.modal.correo")}</label>
                        <input
                            className={`form-control ${errorsEdit?.username ? 'is-invalid' : ''}`}
                            type="text"
                            placeholder={t("viewUsers.modal.modalEditar.placeholderCorreo")}
                            {...registerEdit('username', {
                                required: t("viewUsers.modal.advertenciaCorreo"),
                            })}
                        />
                        {errorsEdit?.username && (
                            <div className="invalid-feedback">
                                {errorsEdit.username.message}
                            </div>
                        )}

                    </div>
                    <div class="mb-3">
                        <label className='form-label'>{t("viewUsers.modal.nombre")}</label>
                        <input
                            className={`form-control ${errorsEdit?.name ? 'is-invalid' : ''}`}
                            type="text"
                            placeholder={t("viewUsers.modal.modalEditar.placeholderNombre")}
                            {...registerEdit('name', {
                                required: t("viewUsers.modal.advertenciaNombre"),
                            })}
                        />
                        {errorsEdit?.name && (
                            <div className="invalid-feedback">
                                {errorsEdit.name.message}
                            </div>
                        )}
                    </div>
                    {/* Select */}
                    <div className="mb-3">
                        <label className='form-label'>{t("viewUsers.labelRol")}</label>
                        <select
                            className={`form-select ${errorsEdit?.rol_id ? 'is-invalid' : ''}`}
                            aria-label="Floating label select example"
                            {...registerEdit('rol_id', {
                                required:t("viewUsers.modal.advertenciaRol"),
                            })}
                        >
                            <option value="">{t("viewUsers.rolSupervisorGeneral")}</option>
                            <option value="2">{t("viewUsers.rolSupervisordePlanta")}</option>
                            <option value="3">{t("viewUsers.rolSupervisordeEnsayista")}</option>
                            <option value="4">{t("viewUsers.rolEnsayista")}</option>
                        </select>
                        {errorsEdit?.rol_id && (
                            <div className="invalid-feedback">
                                {errorsEdit.rol_id.message}
                            </div>
                        )}
                    </div>

                    <hr />

                    {
                        viewChangePassword ? (
                            <div className='mb-3'>
                                <button type='button' disabled className='btn btn-success w-100'>
                                    <i className='fas fa-lock-open me-2'></i> {t("viewUsers.modal.modalEditar.cambiar")}
                                </button>
                            </div>
                        ) : (
                            <div className='mb-3'>
                                <button type='button' onClick={() => setViewChangePassword(true)} className='btn btn-outline-warning w-100'>
                                    <i className='fas fa-lock me-2'></i> {t("viewUsers.modal.modalEditar.cambiar")}
                                </button>
                            </div>
                        )
                    }


                    {viewChangePassword && (
                        <>
                            <div className="mb-3">
                                <label className="form-label">{t("viewUsers.modal.modalEditar.contraseñaAnterior")}</label>
                                <input
                                    className={`form-control ${errorsEdit?.confirm_password ? 'is-invalid' : ''}`}
                                    type="password"
                                    placeholder={t("viewUsers.modal.modalEditar.placeholderAnterior")}
                                    {...registerEdit("confirm_password", {
                                        required: t("viewUsers.modal.modalEditar.errorAnterior"),
                                        minLength: { value: 6, message: t("viewUsers.modal.modalEditar.errorMinLeg") },
                                    })}
                                />
                                {errorsEdit?.confirm_password && (
                                    <div className="invalid-feedback">
                                        {errorsEdit?.confirm_password.message}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">{t("viewUsers.modal.modalEditar.nueva")}</label>
                                <input
                                    className={`form-control ${errorsEdit?.new_password ? 'is-invalid' : ''}`}
                                    type="password"
                                    placeholder={t("viewUsers.modal.modalEditar.placeholderNueva")}
                                    {...registerEdit("new_password", {
                                        required: t("viewUsers.modal.modalEditar.errorNueva"),
                                        minLength: { value: 6, message: t("viewUsers.modal.modalEditar.errorMinLeg") },
                                    })}
                                />
                                {errorsEdit?.new_password && (
                                    <div className="invalid-feedback">
                                        {errorsEdit?.new_password.message}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">{t("viewUsers.modal.modalEditar.labelConfirmNewPassword")}</label>
                                <input
                                    className={`form-control ${errorsEdit?.repit_Password ? 'is-invalid' : ''}`}
                                    type="password"
                                    placeholder={t("viewUsers.modal.modalEditar.placeholderConfirmNewPassword")}
                                    {...registerEdit("repit_Password", {
                                        required: t("viewUsers.modal.modalEditar.errorRepeatPasswordRequired"),
                                        validate: value =>
                                            value === new_password || t("viewUsers.modal.modalEditar.errorPasswordsMismatch"),
                                    })}
                                />
                                {errorsEdit?.repit_Password && (
                                    <div className="invalid-feedback">
                                        {errorsEdit?.repit_Password.message}
                                    </div>
                                )}
                            </div>
                        </>
                    )}


                    <div className='row'>
                        <div className="col-6">
                            <button type="button" className="btn btn-secondary w-100" onClick={toggleModalEdit}>{t("viewUsers.modal.modalEditar.buttonCancel")}</button>
                        </div>
                        <div className="col-6">
                            <button type="submit" className="btn btn-info w-100">
                                <i class="fas fa-pen me-2"></i>{t("viewUsers.modal.modalEditar.buttonEditUser")}
                            </button>
                        </div>

                    </div>

                </form>
            </CustomModal>

            {/* Delete User */}
            <CustomModal isOpen={modalDelete} toggle={toggleModalDelete} modalTitle={t("viewUsers.modal.modalEliminar.modalDeleteTitle")}>
                <p className='text-center'>{t("viewUsers.modal.modalEliminar.modalDeleteConfirm")} <span className='fw-bolder'>{userSelected.name}</span>?</p>
                <p className=''>{t("viewUsers.modal.modalEliminar.modalDeleteWarning")}</p>
                <div className='row'>
                    <div className="col-6">
                        <button type="button" className="btn btn-secondary w-100" onClick={toggleModalDelete}>{t("viewUsers.modal.modalEliminar.buttonDeleteCancel")}</button>
                    </div>
                    <div className="col-6">
                        <button onClick={deleteUser} type="button" className="btn btn-danger w-100">
                            <span className='fas fa-trash me-2'></span> {t("viewUsers.modal.modalEliminar.buttonDeleteConfirm")}
                        </button>
                    </div>
                </div>
            </CustomModal>

            <div className="container py-4">
                <h1 className="h3 fw-bold">{t("viewUsers.modal.modalEliminar.pageTitleUsers")}</h1>
                <p className="text-muted">{t("viewUsers.modal.modalEliminar.pageDescriptionUsers")}</p>
                {/* Tabla de usuarios */}
                <div>
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <ServerSideTable
                                columns={columns}
                                fetchData={fetchUsers}
                                queryKey="users"
                                initialPageSize={10}
                                filtersConfig={filtersConfig}
                                enableDateFilter={false}
                                enableGlobalSearch={false}
                                addButton={button}

                            />
                        </div>
                    </div>

                </div>

                <ToastContainer
                />
            </div>
        </>
    )
}
