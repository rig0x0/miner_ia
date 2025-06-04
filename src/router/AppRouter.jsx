import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Login } from '../pages/Login'
import { Users } from '../pages/Users'
import { NewUser } from '../pages/NewUser'
import { ToastContainer } from 'react-toastify'
import { Ejemplo } from '../pages/Ejemplo'
import { Ensaye } from '../pages/Ensaye'
import { RegistrarEnsaye } from '../pages/RegistrarEnsaye'
import { VerEnsayesEnsayista } from '../pages/VerEnsayesEnsayista'
import { Prediccion } from '../pages/Prediccion'

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/agregar-usuario" element={<NewUser />} />
        <Route path="/ejemplo" element={<Ejemplo />} />
        <Route path="/ensaye" element={<Ensaye />} />
        <Route path="/registrar-ensaye" element={<RegistrarEnsaye />} />
        <Route path="/ver-ensayes" element={<VerEnsayesEnsayista />} />
        <Route path="/predicciones" element={<Prediccion />} />
        {/* <Route path="/dashboard" element={<Login />}/> */}
        {/* <Route path="/dashboard/ensayista" element={<Login />}/> */}

      </Routes>
    </>
  )
}
