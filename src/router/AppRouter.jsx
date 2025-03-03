import React from 'react'
import { Route, Routes } from 'react-router'
import { Login } from '../pages/Login'

export const AppRouter = () => {
  return (
    <>
        <Routes>
            <Route path="/login" element={<Login />}/>
            {/* <Route path="/dashboard" element={<Login />}/> */}
            {/* <Route path="/dashboard/ensayista" element={<Login />}/> */}
            
        </Routes>
    </>
  )
}