import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { CreateUser } from '../components/UsersComponents/CreateUser'
import { ViewUser } from '../components/UsersComponents/ViewUser'

export const Users = () => {
  return (
    <>
      <main class="main" id="top">
        <Sidebar />
        <Topbar />
        <div className="content container">
          <ViewUser />
        </div>
      </main>
    </>
  )
}
