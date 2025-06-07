import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Login } from '../pages/Login'
import { Users } from '../pages/Users'
import { NewUser } from '../pages/NewUser'
import { ToastContainer } from 'react-toastify'
import { Ensaye } from '../pages/Ensaye'
import { RegistrarEnsaye } from '../pages/RegistrarEnsaye'
import { VerEnsayesEnsayista } from '../pages/VerEnsayesEnsayista'
import { Prediccion } from '../pages/Prediccion'
import { ResumeDashboard } from '../pages/ResumeDashboard'
import { Reportes } from '../pages/Reportes'
import { DetalleEnsaye } from '../pages/DetalleEnsaye'
import { Ensayes } from '../pages/Ensayes'
import { Unauthorized } from '../pages/Unauthorized'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleBasedRoute } from './RolBaseRoute'

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="login" />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas de supervisores */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Supervisor General']}>
                <Users />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/predicciones"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Supervisor General', "Supervisor de Planta"]}>
                <Prediccion />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/detalles-ensaye/:id"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Supervisor General', "Supervisor de Planta", "Supervisor de Ensayista"]}>
                <DetalleEnsaye />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Supervisor General', "Supervisor de Planta"]}>
                <ResumeDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/generar-reporte"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Supervisor General', "Supervisor de Planta", "Supervisor de Ensayista"]}>
                <Reportes />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ensayes"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Supervisor General', "Supervisor de Planta", "Supervisor de Ensayista"]}>
                <Ensayes />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* <Route path="/usuarios" element={<Users />} /> */}
        {/* Rutas de Ensayista */}
        <Route
          path="/ensaye"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Ensayista']}>
                <Ensaye />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/registrar-ensaye"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Ensayista']}>
                <RegistrarEnsaye />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* <Route path="/ensaye" element={<Ensaye />} /> */}
        {/* <Route path="/registrar-ensaye" element={<RegistrarEnsaye />} /> */}

        {/* <Route path="/ver-ensayes" element={<VerEnsayesEnsayista />} /> */}

        {/* <Route path="/predicciones" element={<Prediccion />} /> */}
        {/* <Route path="/detalles-ensaye/:id" element={<DetalleEnsaye />} /> */}
        {/* <Route path="/dashboard" element={<ResumeDashboard />} /> */}
        {/* <Route path="/generar-reporte" element={<Reportes />} /> */}
        {/* <Route path="/ensayes" element={<Ensayes />} /> */}

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  )
}
