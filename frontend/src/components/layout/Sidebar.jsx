
import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  BarChart3,
  Bell,
  UserCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

function Sidebar() {
  const { user, logout } = useAuth()
  const role = user?.role?.toUpperCase()

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("hostelops-sidebar-collapsed") === "true"
  )

  useEffect(() => {
    localStorage.setItem(
      "hostelops-sidebar-collapsed",
      String(collapsed)
    )
  }, [collapsed])

  const navigation =
    role === "ADMIN"
      ? [
          { label: "Overview", path: "/admin", icon: LayoutDashboard },
          { label: "Complaints", path: "/complaints", icon: ClipboardList },
          { label: "Maintenance", path: "/maintenance", icon: Wrench },
          { label: "Analytics", path: "/analytics", icon: BarChart3 },
          { label: "Notifications", path: "/notifications", icon: Bell },
        ]
      : role === "WARDEN"
        ? [
            { label: "Overview", path: "/", icon: LayoutDashboard },
            { label: "Complaints", path: "/complaints", icon: ClipboardList },
            { label: "Maintenance", path: "/maintenance", icon: Wrench },
            { label: "Analytics", path: "/analytics", icon: BarChart3 },
            { label: "Notifications", path: "/notifications", icon: Bell },
          ]
        : role === "TECHNICIAN"
          ? [
              { label: "Overview", path: "/", icon: LayoutDashboard },
              {
                label: "Assigned Complaints",
                path: "/assigned-complaints",
                icon: ClipboardList,
              },
              { label: "Notifications", path: "/notifications", icon: Bell },
            ]
          : [
              { label: "Overview", path: "/", icon: LayoutDashboard },
              { label: "My Complaints", path: "/complaints", icon: ClipboardList },
              { label: "Notifications", path: "/notifications", icon: Bell },
            ]

  const linkStyle = ({ isActive }) =>
    `hostelops-nav-link group relative flex w-full items-center ${
      collapsed ? "justify-center px-2" : "gap-3 px-3.5"
    } overflow-hidden rounded-xl py-3 text-sm font-medium ${
      isActive
        ? "hostelops-nav-active bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/30"
        : "text-slate-400 hover:translate-x-1 hover:bg-white/[0.07] hover:text-white"
    }`

  return (
    <>
      <style>{`
        @keyframes hostelopsNavEnter {
          from {
            opacity: 0;
            transform: translateY(7px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes hostelopsIndicatorEnter {
          from {
            transform: scaleY(0.15);
            opacity: 0;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        .hostelops-nav-item {
          animation: hostelopsNavEnter 380ms ease-out both;
        }

        .hostelops-nav-link {
          transition:
            background-color 220ms ease,
            color 220ms ease,
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .hostelops-nav-link::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3px;
          border-radius: 0 999px 999px 0;
          background: white;
          opacity: 0;
          transform: scaleY(0.3);
          transform-origin: center;
          pointer-events: none;
        }

        .hostelops-nav-active::before {
          animation: hostelopsIndicatorEnter 260ms ease-out both;
          opacity: 1;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.75);
        }

        .hostelops-sidebar-glow {
          transition: opacity 400ms ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .hostelops-nav-item,
          .hostelops-nav-active::before {
            animation: none !important;
          }

          .hostelops-nav-link,
          .hostelops-sidebar-glow {
            transition: none !important;
          }
        }
      `}</style>

      <aside
        className={`relative hidden shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#101426] text-white transition-[width] duration-300 ease-in-out lg:flex ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {/* Ambient background effects */}
        <div className="hostelops-sidebar-glow pointer-events-none absolute -left-24 top-24 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="hostelops-sidebar-glow pointer-events-none absolute -right-24 bottom-32 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />

        {/* Brand */}
        <div
          className={`relative flex h-[76px] shrink-0 items-center border-b border-white/[0.08] ${
            collapsed ? "justify-center px-2" : "gap-3 px-5"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-lg shadow-blue-500/25 transition-transform duration-300 hover:rotate-[-6deg] hover:scale-110">
            <span className="text-lg font-black text-white">H</span>
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold tracking-tight text-white">
                HostelOps
              </p>
              <p className="mt-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Hostel operations
              </p>
            </div>
          )}

          {!collapsed && (
            <Sparkles
              size={15}
              className="shrink-0 text-indigo-300 transition-transform duration-500 hover:rotate-45"
            />
          )}
        </div>

        {/* Animated collapse control */}
        <div
          className={`relative flex ${
            collapsed ? "justify-center" : "justify-end"
          } px-3 pt-3`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((previous) => !previous)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-90"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        {/* Main navigation */}
        <nav
          aria-label="Main navigation"
          className="relative flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 py-5"
        >
          {!collapsed && (
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>
          )}

          {navigation.map((item, index) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="hostelops-nav-item"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <NavLink
                  to={item.path}
                  end={item.path === "/" || item.path === "/admin"}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  className={linkStyle}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={19}
                        strokeWidth={1.9}
                        className={`shrink-0 transition-all duration-300 ${
                          isActive
                            ? "scale-105 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.35)]"
                            : "text-slate-500 group-hover:scale-110 group-hover:text-indigo-300"
                        }`}
                      />

                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">
                            {item.label}
                          </span>
                          <ChevronRight
                            size={15}
                            className={`shrink-0 transition-all duration-300 ${
                              isActive
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                            }`}
                          />
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            )
          })}
        </nav>

        {/* Account actions */}
        <div className="relative shrink-0 border-t border-white/[0.08] p-3">
          {!collapsed && (
            <p className="mb-3 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Account
            </p>
          )}

          <NavLink
            to="/profile"
            title={collapsed ? "Profile" : undefined}
            aria-label="Profile"
            className={linkStyle}
          >
            {({ isActive }) => (
              <>
                <UserCircle
                  size={19}
                  className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                />
                {!collapsed && <span className="flex-1">Profile</span>}
                {!collapsed && isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                )}
              </>
            )}
          </NavLink>

          <button
            type="button"
            onClick={logout}
            title={collapsed ? "Sign out" : undefined}
            aria-label="Sign out"
            className={`group mt-1.5 flex w-full items-center rounded-xl py-3 text-sm font-medium text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 active:scale-[0.98] ${
              collapsed ? "justify-center px-2" : "gap-3 px-3.5"
            }`}
          >
            <LogOut
              size={19}
              className="shrink-0 text-slate-500 transition-all duration-300 group-hover:rotate-[-8deg] group-hover:text-red-300"
            />
            {!collapsed && <span>Sign out</span>}
          </button>

          <div
            title={collapsed ? "Workspace active" : undefined}
            className={`mt-4 flex items-center rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 ${
              collapsed ? "justify-center px-2" : "gap-2 px-3"
            }`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            {!collapsed && (
              <span className="whitespace-nowrap text-xs text-slate-400">
                Workspace active
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
