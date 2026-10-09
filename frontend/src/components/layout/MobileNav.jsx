
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  ClipboardList,
  ChartNoAxesCombined,
  Wrench,
  Bell,
  Menu,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"

function MobileNav() {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()

  const navigation =
    role === "ADMIN"
      ? [
          { label: "Overview", path: "/admin", icon: LayoutDashboard },
          { label: "Complaints", path: "/complaints", icon: ClipboardList },
          { label: "Maintenance", path: "/maintenance", icon: Wrench },
          {
  label: "Analytics",
  path: "/analytics",
  icon: ChartNoAxesCombined,
},
          { label: "Notifications", path: "/notifications", icon: Bell },
        ]
      : role === "WARDEN"
        ? [
            { label: "Overview", path: "/", icon: LayoutDashboard },
            { label: "Complaints", path: "/complaints", icon: ClipboardList },
            { label: "Maintenance", path: "/maintenance", icon: Wrench },
            {
  label: "Analytics",
  path: "/analytics",
  icon: ChartNoAxesCombined,
},
            { label: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
            { label: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
            { label: "Notifications", path: "/notifications", icon: Bell },
          ]
        : role === "TECHNICIAN"
          ? [
              { label: "Overview", path: "/", icon: LayoutDashboard },
              {
                label: "Assigned",
                path: "/assigned-complaints",
                icon: ClipboardList,
              },
              { label: "Notifications", path: "/notifications", icon: Bell },
            ]
          : [
              { label: "Overview", path: "/", icon: LayoutDashboard },
              { label: "My complaints", path: "/complaints", icon: ClipboardList },
              { label: "Notifications", path: "/notifications", icon: Bell },
            ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/" || item.path === "/admin"}
              className={({ isActive }) =>
                `flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium transition ${
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-500 hover:text-slate-900"
                }`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium transition ${
              isActive
                ? "text-indigo-600"
                : "text-slate-500 hover:text-slate-900"
            }`
          }
        >
          <Menu size={19} strokeWidth={1.8} />
          <span>More</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default MobileNav
