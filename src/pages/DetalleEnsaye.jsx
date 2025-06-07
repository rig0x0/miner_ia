import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { DetailsEnsaye } from '../components/DetalleComponents/DetailsEnsaye'


export const DetalleEnsaye = () => {
    return (
        <>
            <main class="main" id="top">
                <Sidebar />
                <Topbar />
                <div className="content container ">
                    <DetailsEnsaye />
                </div>
            </main>
        </>
    )
}