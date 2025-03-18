import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { CreateUser } from '../components/UsersComponents/CreateUser'

export const NewUser = () => {
    return (
        <>
            <main class="main" id="top">
                <Sidebar />
                <Topbar />
                <div className="content ">
                    <CreateUser />
                </div>
            </main>
        </>
    )
}
