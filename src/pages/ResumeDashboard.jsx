import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { SupervisorDashboard } from '../components/UsersComponents/SupervisorDashboard'


export const ResumeDashboard = () => {
    return (
        <>
            <main class="main" id="top">
                <Sidebar />
                <Topbar />
                <div className="content container ">
                    <SupervisorDashboard />
                </div>
            </main>
        </>
    )
}
