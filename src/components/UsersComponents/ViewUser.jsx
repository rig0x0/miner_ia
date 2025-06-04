import React, { useEffect, useState } from 'react'
import clienteAxios from '../../config/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Table } from '../Table'
import { CustomModal } from '../CustomModal'
import { useForm } from 'react-hook-form'
import { throwNotification } from '../../helpers/ThrowNotification'
import { ToastContainer } from 'react-toastify'
import { Spinner } from 'reactstrap'

export const ViewUser = () => {

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
            throwNotification("El usuario se ha registrado en el sistema satisfactoriamente.", "success");

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
            throwNotification("Error al crear el usuario: " + error.response?.data?.detail, "error");
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
            throwNotification(`El usuario con ID: ${data.id}, se ha editado satisfactoriamente.`, "success");

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
            throwNotification("Error al intentar editar al usuario: " + error.response?.data?.detail, "error");
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
            throwNotification("El usuario ha sido eliminado del sistema", "success");

            // Invalidar la query de los usuarios para forzar la recarga
            queryClient.invalidateQueries(["users"]);

            toggleModalDelete()
        },
        onError: (error) => {
            console.error('Error al crear el usuario', error);

            throwNotification("Error al intentar eliminar al usuario: " + error.response?.data?.detail, "error");
            // Manejo de error si la solicitud falla.
        },
    });

    const getUsers = async () => {
        const { data } = await clienteAxios.get('/user/')
        console.log(data)
        return data
    }

    const { data: users, error, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

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
        text: 'Registrar Nuevo Usuario',
        className: 'btn btn-primary w-100',
        icon: {
            available: true,
            className: 'fas fa-plus me-2'
        },
        onClick: () => {
            setModalOpen(true)
        }
    }

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id'
        },
        {
            header: 'Correo Electrónico',
            accessorKey: 'email'
        },
        {
            header: 'Nombre del Usuario',
            accessorKey: 'name'
        },
        {
            id: 'rol',
            header: 'Rol del Usuario',
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
            header: 'Acciones',
            cell: ({ row }) => {
                return (
                    <>
                        <div className="">
                            <td class="d-flex justify-content-center white-space-nowrap text-end pe-0">
                                <div class="btn-reveal-trigger position-static">
                                    <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent">
                                        <span class="fas fa-ellipsis-h fs-9"></span>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-end py-2">
                                        <button
                                            class="dropdown-item"
                                            onClick={() => openEditModal(row.original)}
                                        >
                                            <i class="fas fa-pen"></i> Editar
                                        </button>
                                        <div class="dropdown-divider">
                                        </div>
                                        <button
                                            class="dropdown-item text-danger"
                                            onClick={() => openDeleteModal(row.original)}
                                        >
                                            <i class="fa-solid fa-trash"></i> Eliminar
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

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <Spinner
                        className="mx-auto"
                        style={{
                            width: '5rem',
                            height: '5rem',
                            borderWidth: '0.8rem',
                        }}
                        color="primary"
                    />
                    <p className="mt-3" style={{ fontSize: '1.2rem', color: '#333' }}>Cargando Información...</p>
                </div>
            </div>
        );
    }


    if (error) return <p>Error: {error.message}</p>;

    return (
        <>
            {/* Register User */}
            <CustomModal isOpen={modalOpen} toggle={toggleModal} modalTitle={"Registrar Nuevo Usuario"}>
                
                <form onSubmit={handleSubmit(onSubmit)}>

                    <div class="mb-3">
                        <label className='form-label'>Correo Electrónico</label>
                        <input
                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                            type="email"
                            placeholder="name@example.com"
                            {...register('username', {
                                required: 'El email es obligatorio',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Email inválido',
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
                        <label className='form-label'>Nombre del Usuario</label>
                        <input
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            type="text"
                            placeholder="Escribe el nombre del usuario"
                            {...register('name', {
                                required: 'El nombre del usuario es obligatorio',
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
                        <label className='form-label'>Rol del Usuario</label>
                        <select
                            className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                            aria-label="Floating label select example"
                            {...register('rol_id', {
                                required: 'El rol del usuario es obligatorio',
                            })}
                        >
                            <option value={null}>Seleccione el Rol del Usuario</option>
                            <option value="1">Supervisor General</option>
                            <option value="2">Supervisor de Planta</option>
                            <option value="3">Supervisor de Ensayista</option>
                            <option value="4">Ensayista</option>
                        </select>
                        {errors.role && (
                            <div className="invalid-feedback">
                                {errors.role.message}
                            </div>
                        )}
                    </div>
                    <div class="mb-3">
                        <label className='form-label'>Escriba la Contraseña</label>
                        <input
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            type="password"
                            placeholder="Password"
                            {...register('password', {
                                required: 'La contraseña es obligatoria',
                                minLength: {
                                    value: 6,
                                    message: 'La contraseña debe tener al menos 6 caracteres',
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
                        <label className='form-label'>Confirme la Contraseña</label>
                        <input
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            type="password"
                            placeholder="Confirmar Contraseña"
                            {...register('confirmPassword', {
                                required: 'Debe repetir la contraseña',
                                validate: value => value === password || 'Las contraseñas no coinciden',
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
                            <button type="button" className="btn btn-secondary w-100" onClick={toggleModal}>Cancelar</button>
                        </div>
                        <div className="col-6">
                            <button type="submit" className="btn btn-primary w-100">
                                <span className='fas fa-plus me-2'></span>Registrar
                            </button>
                        </div>

                    </div>

                </form>
            </CustomModal>

            {/* Edit User */}
            <CustomModal isOpen={modalEdit} toggle={toggleModalEdit} modalTitle={"Editar Usuario"}>
                <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
                    <div class="mb-3">
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            className={`form-control ${errorsEdit?.username ? 'is-invalid' : ''}`}
                            type="text"
                            placeholder="Escribe el correo del usuario"
                            {...registerEdit('username', {
                                required: 'El correo del usuario es obligatorio',
                            })}
                        />
                        {errorsEdit?.username && (
                            <div className="invalid-feedback">
                                {errorsEdit.username.message}
                            </div>
                        )}

                    </div>
                    <div class="mb-3">
                        <label className='form-label'>Nombre del Usuario</label>
                        <input
                            className={`form-control ${errorsEdit?.name ? 'is-invalid' : ''}`}
                            type="text"
                            placeholder="Escribe el nombre del usuario"
                            {...registerEdit('name', {
                                required: 'El nombre del usuario es obligatorio',
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
                        <label className='form-label'>Rol del Usuario</label>
                        <select
                            className={`form-select ${errorsEdit?.rol_id ? 'is-invalid' : ''}`}
                            aria-label="Floating label select example"
                            {...registerEdit('rol_id', {
                                required: 'El rol del usuario es obligatorio',
                            })}
                        >
                            <option value="">Seleccione el Rol del Usuario</option>
                            <option value="2">Supervisor de Planta</option>
                            <option value="3">Supervisor de Ensayista</option>
                            <option value="4">Ensayista</option>
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
                                    <i className='fas fa-lock-open me-2'></i> Cambiar Contraseña
                                </button>
                            </div>
                        ) : (
                            <div className='mb-3'>
                                <button type='button' onClick={() => setViewChangePassword(true)} className='btn btn-outline-warning w-100'>
                                    <i className='fas fa-lock me-2'></i> Cambiar Contraseña
                                </button>
                            </div>
                        )
                    }


                    {viewChangePassword && (
                        <>
                            <div className="mb-3">
                                <label className="form-label">Escriba la Contraseña Anterior</label>
                                <input
                                    className={`form-control ${errorsEdit?.confirm_password ? 'is-invalid' : ''}`}
                                    type="password"
                                    placeholder="Escribe la contraseña anterior"
                                    {...registerEdit("confirm_password", {
                                        required: "La anterior contraseña es obligatoria",
                                        minLength: { value: 6, message: "La contraseña debe tener al menos 6 caracteres" },
                                    })}
                                />
                                {errorsEdit?.confirm_password && (
                                    <div className="invalid-feedback">
                                        {errorsEdit?.confirm_password.message}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Escriba la Nueva Contraseña</label>
                                <input
                                    className={`form-control ${errorsEdit?.new_password ? 'is-invalid' : ''}`}
                                    type="password"
                                    placeholder="Escribe la nueva contraseña"
                                    {...registerEdit("new_password", {
                                        required: "La nueva contraseña es obligatoria",
                                        minLength: { value: 6, message: "La contraseña debe tener al menos 6 caracteres" },
                                    })}
                                />
                                {errorsEdit?.new_password && (
                                    <div className="invalid-feedback">
                                        {errorsEdit?.new_password.message}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Confirme la Nueva Contraseña</label>
                                <input
                                    className={`form-control ${errorsEdit?.repit_Password ? 'is-invalid' : ''}`}
                                    type="password"
                                    placeholder="Confirmar nueva contraseña"
                                    {...registerEdit("repit_Password", {
                                        required: "Debe repetir la contraseña",
                                        validate: value =>
                                            value === new_password || "Las contraseñas no coinciden",
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
                            <button type="button" className="btn btn-secondary w-100" onClick={toggleModalEdit}>Cancelar</button>
                        </div>
                        <div className="col-6">
                            <button type="submit" className="btn btn-info w-100">
                                <i class="fas fa-pen me-2"></i>Editar Usuario
                            </button>
                        </div>

                    </div>

                </form>
            </CustomModal>

            {/* Delete User */}
            <CustomModal isOpen={modalDelete} toggle={toggleModalDelete} modalTitle={"Eliminar Usuario"}>
                <p className='text-center'>¿Estás seguro de que quieres eliminar a este usuario <span className='fw-bolder'>{userSelected.name}</span>?</p>
                <p className=''>Al eliminar al usuario, este perderá el acceso total a la plataforma y no podrás revertir el proceso.</p>
                <div className='row'>
                    <div className="col-6">
                        <button type="button" className="btn btn-secondary w-100" onClick={toggleModalDelete}>Cancelar</button>
                    </div>
                    <div className="col-6">
                        <button onClick={deleteUser} type="button" className="btn btn-danger w-100">
                            <span className='fas fa-trash me-2'></span> Sí, Eliminar
                        </button>
                    </div>
                </div>
            </CustomModal>


            <div className="mb-4">
                <div className="row">
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

            {/* Tabla de usuarios */}
            <div>
                <Table
                    placeholder={"Buscar por Nombre, ID o Correo"}
                    data={users}
                    columns={columns}
                    addButton={button}
                />
            </div>

            <ToastContainer
            />
        </>
    )
}
