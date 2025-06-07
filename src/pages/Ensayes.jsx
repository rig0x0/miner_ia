import React from 'react'
import { EnsayesInit } from '../components/EnsayesComponent.jsx/EnsayesInit'
import { Topbar } from '../components/Topbar'
import { Sidebar } from '../components/Sidebar'

export const Ensayes = () => {
    return (
        <main class="main" id="top">
            <Sidebar />
            <Topbar />
            <div className="content container">
                <EnsayesInit />
            </div>
        </main>
    )
}
