import React from "react";

export const Login = () => {
    return (
        <>
            <div className="main" id="top">
                <div className="container d-flex justify-content-center">
                    <div className="row w-100">
                        <div class="text-center">
                            <h3 class="text-body-highlight">Bienvenido</h3>
                            <p class="text-body-tertiary">Ingresa tus credenciales</p>
                        </div>
                        <form>
                            <div class="position-relative">
                                <hr class="bg-body-secondary mt-5 mb-4" />
                                <div class="divider-content-center"></div>
                            </div>
                            <div class="mb-3 text-start">
                                <label class="form-label" for="email">Email </label>
                                <div class="form-icon-container">
                                    <input class="form-control form-icon-input" id="email" type="email" placeholder="name@example.com" /><span class="fas fa-user text-body fs-9 form-icon"></span>
                                </div>
                            </div>
                            <div class="mb-3 text-start">
                                <label class="form-label" for="password">Password</label>
                                <div class="form-icon-container" data-password="data-password">
                                    <input class="form-control form-icon-input pe-6" id="password" type="password" placeholder="Password" data-password-input="data-password-input" /><span class="fas fa-key text-body fs-9 form-icon"></span>
                                </div>
                            </div>

                            <button class="btn btn-primary w-100 mb-3 mt-4">Ingresar</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}