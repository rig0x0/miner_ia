import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { Ensayes } from '../components/EnsayeComponents/Ensayes'

export const VerEnsayesEnsayista = () => {
    return (
        <>
            <main class="main" id="top">
                <Sidebar />
                <Topbar />
                <div className="content container">
                    <Ensayes />
                </div>
            </main>
        </>
    )
}
