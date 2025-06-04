import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { GenerateReport } from '../components/UsersComponents/GenerateReport'

export const Reports = () => {
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
