import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Login } from '../pages/Login'
import { Users } from '../pages/Users'
import { NewUser } from '../pages/NewUser'
import { ResumeDashboard } from '../pages/ResumeDashboard'
import { DetalleEnsaye } from '../pages/DetalleEnsaye'
import { Reports } from '../pages/Reports'
import { Ejemplo } from '../components/Ejemplo.jsx'


export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/agregar-usuario" element={<NewUser />} />
        <Route path="/detalles-ensaye/:id" element={<DetalleEnsaye />} />
        <Route path="/dashboard" element={<ResumeDashboard />} />
        <Route path="/generar-reporte" element={<Reports />} />
        <Route path="/ejemplo" element={<Ejemplo />} />
        {/* <Route path="/dashboard" element={<Login />}/> */}
        {/* <Route path="/dashboard/ensayista" element={<Login />}/> */}

      </Routes>
    </>
  )
}
