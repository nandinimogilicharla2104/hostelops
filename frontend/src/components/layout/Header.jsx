import {
  Search,
  Bell,
  ChevronDown,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"

function Header() {
  const { user } = useAuth()

  return (
    <header className="flex h-18 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          strokeWidth={1.8}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search complaints, rooms, technicians..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Right actions */}
      <div className="ml-4 flex items-center gap-2">

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

        {/* Profile */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-800">
              {user?.name}
            </p>

            <p className="text-xs text-slate-400">
              {user?.role}
            </p>
          </div>

          <ChevronDown
            size={16}
            strokeWidth={1.8}
            className="hidden text-slate-400 sm:block"
          />

        </button>

      </div>

    </header>
  )
}

export default Header