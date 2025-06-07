import { GenerateReport } from '../components/ReporteComponents/GenerateReport'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'

export const Reportes = () => {
  return (
    <>
      <main class="main" id="top">
        <Sidebar />
        <Topbar />
        <div className="content container">
            <GenerateReport />
        </div>
      </main>
    </>
  )
}