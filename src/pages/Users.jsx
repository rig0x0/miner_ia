import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { CreateUser } from '../components/UsersComponents/CreateUser'

export const Users = () => {
  return (
    <>
        <main class="main" id="top">
            <Sidebar />
            <Topbar />
            <div className="content ">
                
            </div>
        </main>
    </>
  )
}
