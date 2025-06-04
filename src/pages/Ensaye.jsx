import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { EnsayeForm } from '../components/EnsayeComponents/EnsayeForm'
import { EnsayeInit } from '../components/EnsayeComponents/EnsayeInit'

export const Ensaye = () => {
    return (
        <>
            <main class="main" id="top">
                <Sidebar />
                <Topbar />
                <div className="content container">
                    <EnsayeInit />
                </div>
            </main>
        </>
    )
}
