import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { PrediccionInit } from '../components/PrediccionComponents/PrediccionInit'

export const Prediccion = () => {
    return (
        <>
            <main class="main" id="top">
                <Sidebar />
                <Topbar />
                <div className="content container">
                    <PrediccionInit/>
                </div>
            </main>
        </>
    )
}
