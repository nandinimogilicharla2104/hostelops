
import { useEffect, useRef, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  Search,
  Bell,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  ClipboardList,
  Wrench,
  BarChart3,
  LayoutDashboard,
  X,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  
  const searchRef = useRef(null)
  const profileRef = useRef(null)

  const role = user?.role?.toUpperCase()

  const searchItems = [
    { label: "Overview", path: role === "ADMIN" ? "/admin" : "/", icon: LayoutDashboard },
    { label: "Complaints", path: "/complaints", icon: ClipboardList },
    { label: "Maintenance", path: "/maintenance", icon: Wrench },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Profile", path: "/profile", icon: UserCircle },
  ]

  const filteredItems = searchItems.filter((item) =>
    item.label.toLowerCase().includes(search.trim().toLowerCase())
  )

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!searchRef.current?.contains(event.target)) {
        setSearchOpen(false)
      }

      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    

    function handleEscape(event) {
      if (event.key === "Escape") {
        setSearchOpen(false)
        setProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  function openDestination(path) {
    navigate(path)
    setSearch("")
    setSearchOpen(false)
    setProfileOpen(false)
  }

  function handleLogout() {
    setProfileOpen(false)
    logout()
  }

  return (
    <header className="relative z-30 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Search */}
      <div ref={searchRef} className="relative min-w-0 flex-1 max-w-md">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && filteredItems.length > 0) {
              openDestination(filteredItems[0].path)
            }
          }}
          placeholder="Search pages..."
          aria-label="Search HostelOps pages"
          aria-expanded={searchOpen}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setSearchOpen(true)
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}

        {searchOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 duration-150">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {search ? "Search results" : "Quick navigation"}
            </p>

            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => openDestination(item.path)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.99]"
                  >
                    <Icon size={17} className="text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                )
              })
            ) : (
              <p className="px-3 py-4 text-sm text-slate-500">
                No matching pages found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-2">
                
        {/* Notifications */}
        <button
          type="button"
          aria-label="Open notifications"
          title="Notifications"
          onClick={() => navigate("/notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition duration-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-90"
        >
          <Bell size={19} strokeWidth={1.8} />
          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>

        <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((previous) => !previous)}
            aria-label="Open account menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition duration-200 hover:bg-slate-50 active:scale-[0.98]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-700 ring-1 ring-indigo-200">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>
              <p className="text-xs capitalize text-slate-400">
                {user?.role?.toLowerCase() || "Account"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition-transform duration-200 sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name || "User"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {user?.email || user?.role || "HostelOps account"}
                </p>
              </div>

              <div className="py-2">
                <button
                  type="button"
                  onClick={() => openDestination("/profile")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <UserCircle size={17} />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => openDestination("/profile")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Settings size={17} />
                  Account Settings
                </button>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 active:scale-[0.99]"
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
