import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  ClipboardList,
  ChartNoAxesCombined,
  Wrench,
  BarChart3,
  Bell,
  UserCircle,
  LogOut,
} from "lucide-react"



function Sidebar() {
  const { user, logout } = useAuth()

  const role = user?.role?.toUpperCase()

  const navigation =
    role === "ADMIN"
      ? [
          {
            label: "Overview",
            path: "/admin",
            icon: LayoutDashboard,
          },
          {
            label: "Complaints",
            path: "/complaints",
            icon: ClipboardList,
          },
          {
            label: "Maintenance",
            path: "/maintenance",
            icon: Wrench,
          },
          {
            label: "Analytics",
            path: "/analytics",
            icon: BarChart3,
          },
          {
            label: "Notifications",
            path: "/notifications",
            icon: Bell,
          },
          {
  label: "Analytics",
  path: "/analytics",
  icon: ChartNoAxesCombined,
},
        ]
      : role === "WARDEN"
        ? [
            {
              label: "Overview",
              path: "/",
              icon: LayoutDashboard,
            },
            {
              label: "Complaints",
              path: "/complaints",
              icon: ClipboardList,
            },
            {
              label: "Maintenance",
              path: "/maintenance",
              icon: Wrench,
            },
            {
              label: "Analytics",
              path: "/analytics",
              icon: BarChart3,
            },
            {
              label: "Notifications",
              path: "/notifications",
              icon: Bell,
            },
            {
  label: "Analytics",
  path: "/analytics",
  icon: ChartNoAxesCombined,
},
          ]
        : role === "TECHNICIAN"
          ? [
              {
                label: "Overview",
                path: "/",
                icon: LayoutDashboard,
              },
              {
                label: "Assigned Complaints",
                path: "/assigned-complaints",
                icon: ClipboardList,
              },
              {
                label: "Notifications",
                path: "/notifications",
                icon: Bell,
              },
            ]
          : [
              {
                label: "Overview",
                path: "/",
                icon: LayoutDashboard,
              },
              {
                label: "My Complaints",
                path: "/complaints",
                icon: ClipboardList,
              },
              {
                label: "Notifications",
                path: "/notifications",
                icon: Bell,
              },
            ]

  return (
    
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">

      {/* Brand */}
      <div className="flex h-18 items-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm">
            H
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight text-slate-950">
              HostelOps
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Operations
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-5">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />

              <span>{item.label}</span>
            </NavLink>
          )
        })}

      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-3">

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`
          }
        >
          <UserCircle size={18} strokeWidth={1.8} />
          Profile
        </NavLink>

        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Sign out
        </button>

      </div>

    </aside>
  )
}

export default Sidebar