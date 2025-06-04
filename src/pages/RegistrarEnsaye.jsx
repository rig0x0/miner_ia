import React from 'react'
import { EnsayeForm } from '../components/EnsayeComponents/EnsayeForm'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'

export const RegistrarEnsaye = () => {
  return (
     <main class="main" id="top">
                    <Sidebar />
                    <Topbar />
                    <div className="content container">
                        <EnsayeForm />
                    </div>
                </main>
  )
}
