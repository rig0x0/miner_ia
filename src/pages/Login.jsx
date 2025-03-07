import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";

export const Login = () => {

    const { login, isLoading, error, clearError } = useAuth();
    const [showAlert, setShowAlert] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        clearError();
        login(data);
    };

    useEffect(() => {
        console.log(error)
        if (error) {
            if (error.code === "ERR_NETWORK") {
                setShowAlert(true);
            }
            else if (error.status === 401) {
                setShowAlert(true);
            } else {
                setShowAlert(false);
            }
        } else {
            setShowAlert(false);
        }
    }, [error]);

    return (
        <>
            <div className="main d-flex align-items-center vh-100">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-4">
                            <div className=" p-4">
                                <div className="text-center mb-4">
                                    <h1>MinerIA</h1>
                                    <h3 className="text-dark fw-bold">Bienvenido</h3>
                                    <p className="text-secondary">Ingresa tus credenciales</p>
                                </div>
                                <form className="needs-validation" onSubmit={handleSubmit(onSubmit)} noValidate>
                                    {/* Email */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" htmlFor="email">Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light"><i className="fas fa-user text-secondary"></i></span>
                                            <input
                                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                                id="email"
                                                type="email"
                                                placeholder="nombre@ejemplo.com"
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
                                    </div>

                                    {/* Password */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" htmlFor="password">Contraseña</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light"><i className="fas fa-key text-secondary"></i></span>
                                            <input
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                id="password"
                                                type="password"
                                                placeholder="********"
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
                                    </div>

                                    {showAlert && (
                                        <p
                                            className="text-danger d-flex align-items-center p-3 bg-light border border-danger rounded mb-0"
                                            style={{ transition: "opacity 0.3s ease-in-out" }}
                                        >
                                            <i className="fas fa-exclamation-circle me-2"></i> {/* Ícono de advertencia */}
                                            {error ? (
                                                error.status === 401 ? (
                                                    error.response.data.detail
                                                ) : error.code === "ERR_NETWORK" ? (
                                                    "Hubo un error de conexión con el servidor, Intentelo de nuevo más tarde."
                                                ) : null
                                            ) : null}
                                        </p>
                                    )}
                                    {/* Botón de login */}
                                    <button type="submit" className="btn btn-dark w-100 mt-3 shadow-sm" disabled={isLoading}>
                                        {
                                            isLoading ? ("Ingresando...") : ("Ingresar")
                                        }
                                    </button>
                                </form>


                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}