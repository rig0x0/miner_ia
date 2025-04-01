import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Login } from '../pages/Login'
import { Users } from '../pages/Users'
import { NewUser } from '../pages/NewUser'
import { ToastContainer } from 'react-toastify'

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/agregar-usuario" element={<NewUser />} />
        {/* <Route path="/dashboard" element={<Login />}/> */}
        {/* <Route path="/dashboard/ensayista" element={<Login />}/> */}

      </Routes>
    </>
  )
}
