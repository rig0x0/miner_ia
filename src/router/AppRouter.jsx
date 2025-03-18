import React from 'react'
import { Route, Routes } from 'react-router'
import { Login } from '../pages/Login'
import { Users } from '../pages/Users'
import { NewUser } from '../pages/NewUser'

export const AppRouter = () => {
  return (
    <>
        <Routes>
            <Route path="/login" element={<Login />}/>
            <Route path="/usuarios" element={<Users />}/>
            <Route path="/agregar-usuario" element={<NewUser />}/>
            {/* <Route path="/dashboard" element={<Login />}/> */}
            {/* <Route path="/dashboard/ensayista" element={<Login />}/> */}
            
        </Routes>
    </>
  )
}
