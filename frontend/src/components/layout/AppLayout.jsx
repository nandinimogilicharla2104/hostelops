import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import MobileNav from "./MobileNav"

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="flex min-h-screen">

        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">

          <Header />

          <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
            <Outlet />
          </main>

        </div>

      </div>

      <MobileNav />
    </div>
  )
}

export default AppLayout