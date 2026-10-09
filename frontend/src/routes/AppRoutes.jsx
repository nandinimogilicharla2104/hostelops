import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Search,
  X,
  DoorOpen,
  Wrench,
  Tag,
  CalendarDays,
  RefreshCw,
  ClipboardList,
} from "lucide-react"

import { Routes, Route, useNavigate, useParams } from "react-router-dom"
import AppLayout from "../components/layout/AppLayout"
import Login from "../pages/Login"
import ProtectedRoute from "./ProtectedRoute"
import Badge from "../components/ui/Badge"
import Card from "../components/ui/Card"
import AssignedComplaints from "../pages/AssignedComplaints"
import AdminDashboard from "../pages/AdminDashboard"


import { useEffect, useState } from "react"
import {
  getComplaints,
  getComplaint,
  getComplaintHistory,
  getComplaintCategories,
  createComplaint,
  getRoomAssignments,
  getNotifications,
  markNotificationAsRead,
  getRooms,
  getWardenDashboard,
  getTechnicians,
  assignComplaint,
  getTechnicianDashboard,
  getAssignedComplaints,
  updateComplaintStatus,
} from "../services/api"

import { getMyProfile } from "../services/api"
import { useAuth } from "../context/AuthContext"

function RoleBasedDashboard() {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()

  if (role === "ADMIN") {
    return <Navigate to="/admin" replace />
  }

  return <Dashboard />
}


function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()


  const [complaints, setComplaints] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [technicians, setTechnicians] = useState([])
  const [selectedStatus, setSelectedStatus] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusError, setStatusError] = useState("")
  const [statusSuccess, setStatusSuccess] = useState("")

  
useEffect(() => {
  if (!user) return

  let cancelled = false

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError("")

      if (role === "WARDEN") {
        const [complaintsData, dashboardData, techniciansData] =
          await Promise.all([
            getComplaints(),
            getWardenDashboard(),
            getTechnicians(),
          ])

        if (cancelled) return

        setComplaints(complaintsData)
        setDashboard(dashboardData)
        setTechnicians(techniciansData)
      } else if (role === "TECHNICIAN") {
        const [dashboardData, assignedComplaints] =
          await Promise.all([
            getTechnicianDashboard(),
            getAssignedComplaints(),
          ])

        if (cancelled) return

        setDashboard(dashboardData)
        setComplaints(assignedComplaints)
        setTechnicians([])
      } else if (role === "STUDENT") {
        const complaintsData = await getComplaints()

        if (cancelled) return

        setComplaints(complaintsData)
        setDashboard(null)
        setTechnicians([])
      } else {
        setError("Your account role is not supported.")
      }
    } catch (error) {
      if (!cancelled) {
        setError(error.message)
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  loadDashboard()

  return () => {
    cancelled = true
  }
}, [user, role])


  const activeComplaints = complaints.filter(
    (complaint) =>
      !["RESOLVED", "CLOSED"].includes(complaint.status)
  )

  const resolvedComplaints = complaints.filter(
    (complaint) =>
      ["RESOLVED", "CLOSED"].includes(complaint.status)
  )

  const highPriorityComplaints = complaints.filter(
    (complaint) =>
      ["HIGH", "CRITICAL"].includes(complaint.priority)
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-700">
          Unable to load your dashboard
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-7 shadow-sm sm:px-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">
            {user?.role?.toUpperCase() === "WARDEN"
              ? "Warden workspace"
              : user?.role?.toUpperCase() === "TECHNICIAN"
                ? "Technician workspace"
                : "Student workspace"}
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              {user?.role?.toUpperCase() === "WARDEN"
                ? "Monitor complaints, track maintenance progress, and manage hostel operations."
                : user?.role?.toUpperCase() === "TECHNICIAN"
                  ? "Manage assigned maintenance requests, update progress, and keep your workload moving."
                  : "Track your maintenance requests and stay updated on hostel operations."}
            </p>
          </div>

          
{role === "STUDENT" && (
  <button
    type="button"
    onClick={() => navigate("/complaints/new")}
    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
  >
    <Plus size={17} />
    New complaint
  </button>
)}
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-32 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
      </section>

      {/* KPI cards */}

      {user?.role?.toUpperCase() === "TECHNICIAN" && (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Total assigned
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {dashboard?.total_assigned ?? complaints.length}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Complaints assigned to you
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Pending
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {dashboard?.pending ?? 0}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Waiting for action
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        In progress
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {dashboard?.in_progress ?? 0}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Currently being handled
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Resolved
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {dashboard?.resolved ?? 0}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Successfully completed
      </p>
    </div>
  </div>
)}

      {user?.role?.toUpperCase() === "WARDEN" && (
  /* ================= WARDEN KPI CARDS ================= */
  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {/* Total */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText size={19} />
          </div>

          <ArrowUpRight size={17} className="text-slate-300" />
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Total complaints
        </p>

        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          {dashboard?.total_complaints ?? 0}
        </p>
      </div>

      {/* Submitted */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock3 size={19} />
          </div>

          <ArrowUpRight size={17} className="text-slate-300" />
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Submitted
        </p>

        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          {dashboard?.submitted ?? 0}
        </p>
      </div>

      {/* Assigned */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Wrench size={19} />
          </div>

          <ArrowUpRight size={17} className="text-slate-300" />
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Assigned
        </p>

        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          {dashboard?.assigned ?? 0}
        </p>
      </div>

      {/* In Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <RefreshCw size={19} />
          </div>

          <ArrowUpRight size={17} className="text-slate-300" />
        </div>

        <p className="mt-5 text-sm text-slate-500">
          In progress
        </p>

        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          {dashboard?.in_progress ?? 0}
        </p>
      </div>

    </section>
)}

{/* ================= STUDENT KPI CARDS ================= */}
{user?.role?.toUpperCase() === "STUDENT" && (
  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

    {/* Total */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FileText size={19} />
        </div>

        <ArrowUpRight size={17} className="text-slate-300" />
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Total complaints
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
        {complaints.length}
      </p>
    </div>

    {/* Active */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Clock3 size={19} />
        </div>

        <ArrowUpRight size={17} className="text-slate-300" />
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Active complaints
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
        {activeComplaints.length}
      </p>
    </div>

    {/* Resolved */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={19} />
        </div>

        <ArrowUpRight size={17} className="text-slate-300" />
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Resolved
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
        {resolvedComplaints.length}
      </p>
    </div>

    {/* High priority */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle size={19} />
        </div>

        <ArrowUpRight size={17} className="text-slate-300" />
      </div>

      <p className="mt-5 text-sm text-slate-500">
        High priority
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
        {highPriorityComplaints.length}
      </p>
    </div>

  </section>
)}


      {/* Recent complaints */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-slate-950">
                {user?.role?.toUpperCase() === "WARDEN"
                  ? "Complaint operations"
                  : user?.role?.toUpperCase() === "TECHNICIAN"
                    ? "Assigned complaints"
                    : "Recent complaints"}
              </h2>

              {user?.role?.toUpperCase() === "WARDEN" && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                  Operations
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {user?.role?.toUpperCase() === "WARDEN"
                ? "Monitor the latest maintenance requests and their progress."
                : user?.role?.toUpperCase() === "TECHNICIAN"
                  ? "Review the maintenance requests currently assigned to you."
                  : "Track the latest maintenance requests from your account."}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
  navigate(
    role === "TECHNICIAN"
      ? "/assigned-complaints"
      : "/complaints"
  )
}
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition hover:text-indigo-700 sm:self-auto"
          >
            View all
            <ArrowUpRight size={15} />
          </button>
        </div>

        {complaints.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <FileText size={20} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No complaints yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
            {user?.role?.toUpperCase() === "WARDEN"
              ? "New maintenance complaints will appear here for review."
              : "When you report a maintenance issue, it will appear here."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {complaints
            .slice()
            .sort(
              (a, b) =>
                new Date(b.updated_at) - new Date(a.updated_at)
            )
            .slice(0, 5)
            .map((complaint) => {
              const priorityStyles = {
                LOW: "bg-slate-100 text-slate-600",
                MEDIUM: "bg-blue-50 text-blue-700",
                HIGH: "bg-amber-50 text-amber-700",
                CRITICAL: "bg-red-50 text-red-700",
              }

              const statusStyles = {
                SUBMITTED: "bg-slate-100 text-slate-700",
                ACKNOWLEDGED: "bg-blue-50 text-blue-700",
                ASSIGNED: "bg-indigo-50 text-indigo-700",
                IN_PROGRESS: "bg-violet-50 text-violet-700",
                RESOLVED: "bg-emerald-50 text-emerald-700",
                CLOSED: "bg-emerald-50 text-emerald-700",
                REOPENED: "bg-rose-50 text-rose-700",
              }

              return (
                <button
                  key={complaint.id}
                  type="button"
                  onClick={() =>
                    navigate(`/complaints/${complaint.id}`)
                  }
                  className="group flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">
                        #{complaint.id}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          priorityStyles[complaint.priority] ||
                          priorityStyles.LOW
                        }`}
                      >
                        {complaint.priority}
                      </span>
                    </div>

                    <h3 className="mt-2 truncate text-sm font-semibold text-slate-900 transition group-hover:text-indigo-600">
                      {complaint.title}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-start">
                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          statusStyles[complaint.status] ||
                          statusStyles.SUBMITTED
                        }`}
                      >
                        {complaint.status.replaceAll("_", " ")}
                      </span>

                      <p className="mt-1.5 text-xs text-slate-400">
                        Updated{" "}
                          {new Date(
                            complaint.updated_at
                          ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400 transition group-hover:text-indigo-600">
                      <span className="hidden sm:inline">
                        View
                      </span>

                      <ArrowUpRight size={17} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Technician Workload */}
      {user?.role?.toUpperCase() === "WARDEN" && (
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                Maintenance team
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              Technician workload
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor technician availability and active workload.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/maintenance")}
            className="hidden items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-700 sm:inline-flex"
          >
            View team
            <ArrowUpRight size={15} />
          </button>
        </div>

        {technicians.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Wrench size={19} />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            No technicians found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Technician records will appear here once they are added.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {technicians.slice(0, 6).map((technician) => {
            const isAvailable =
              technician.is_available ?? technician.available ?? true

            const workload =
              technician.workload ??
              technician.active_complaints ??
              technician.current_workload ??
              0

            return (
              <div
                key={technician.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-600">
                      {technician.name
                        ?.charAt(0)
                        ?.toUpperCase() || "T"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {technician.name || `Technician #${technician.id}`}
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Technician #{technician.id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isAvailable
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />

                    {isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Active workload
                    </p>

                    <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                      {workload}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    <Wrench size={17} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )}

    </div>
  )
}

function Complaints() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const role = user?.role?.toUpperCase()

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")

  const [sortBy, setSortBy] = useState("UPDATED_DESC")

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getComplaints()

      setComplaints(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  const filteredComplaints = complaints
    .filter((complaint) => {
      const matchesSearch =
        complaint.title.toLowerCase().includes(search.toLowerCase()) ||
        complaint.description.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "ALL" || complaint.status === statusFilter

      const matchesPriority =
        priorityFilter === "ALL" || complaint.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      if (sortBy === "UPDATED_DESC") {
        return new Date(b.updated_at) - new Date(a.updated_at)
      }

      if (sortBy === "CREATED_DESC") {
        return new Date(b.created_at) - new Date(a.created_at)
      }

      if (sortBy === "CREATED_ASC") {
        return new Date(a.created_at) - new Date(b.created_at)
      }

      if (sortBy === "PRIORITY") {
        const priorityRank = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        }

        return (
          priorityRank[b.priority] - priorityRank[a.priority]
        )
      }

      return 0
    })

  const getStatusVariant = (status) => {
    if (status === "RESOLVED" || status === "CLOSED") {
      return "success"
    }

    if (status === "REOPENED") {
      return "danger"
    }

    if (status === "IN_PROGRESS" || status === "ASSIGNED") {
      return "info"
    }

    if (status === "ACKNOWLEDGED") {
      return "warning"
    }

    return "default"
  }

  const getPriorityVariant = (priority) => {
    if (priority === "CRITICAL") {
      return "danger"
    }

    if (priority === "HIGH") {
      return "warning"
    }

    if (priority === "MEDIUM") {
      return "info"
    }

    return "default"
  }


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
  {role === "STUDENT"
    ? "Student workspace"
    : role === "WARDEN"
      ? "Warden workspace"
      : role === "ADMIN"
        ? "Admin workspace"
        : "Complaints"}
</p>

            {!loading && !error && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {complaints.length} total
              </span>
            )}
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
  {role === "STUDENT"
    ? "My complaints"
    : role === "WARDEN"
      ? "Complaint operations"
      : role === "ADMIN"
        ? "All complaints"
        : "Complaints"}
</h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
  {role === "STUDENT"
    ? "Track your maintenance requests, review their progress, and stay updated until each issue is resolved."
    : role === "WARDEN"
      ? "Review hostel complaints, monitor priorities, and manage issues through resolution."
      : role === "ADMIN"
        ? "Monitor complaints across the hostel system and track operational activity."
        : "Review complaint information and status."}
</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={fetchComplaints}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {role === "STUDENT" && (
  <button
    type="button"
    onClick={() => navigate("/complaints/new")}
    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
  >
    <Plus size={17} />
    New complaint
  </button>
)}
        </div>
        </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
    
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search complaints..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-44"
          >
            <option value="ALL">All statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-44"
          >
            <option value="ALL">All priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-48"
          >
            <option value="UPDATED_DESC">Recently updated</option>
            <option value="CREATED_DESC">Newest first</option>
            <option value="CREATED_ASC">Oldest first</option>
            <option value="PRIORITY">Highest priority</option>
          </select>
        </div>

        {/* Active filters / result count */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </span>

          {(search || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setStatusFilter("ALL")
                setPriorityFilter("ALL")
              }}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {complaints.length}
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
              Active
            </p>
            <p className="mt-2 text-2xl font-bold text-indigo-700">
              {
                complaints.filter(
                  (complaint) =>
                    complaint.status !== "RESOLVED" &&
                    complaint.status !== "CLOSED"
                  ).length
                }
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Resolved
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {
                complaints.filter(
                  (complaint) =>
                    complaint.status === "RESOLVED" ||
                    complaint.status === "CLOSED"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              High priority
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-700">
              {
                complaints.filter(
                  (complaint) =>
                    complaint.priority === "HIGH" ||
                    complaint.priority === "CRITICAL"
                ).length
              }
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="animate-pulse">
            {/* Top badges */}
            <div className="flex gap-2">
              <div className="h-6 w-10 rounded-md bg-slate-100" />
              <div className="h-6 w-16 rounded-full bg-slate-100" />
              <div className="h-6 w-20 rounded-full bg-slate-100" />
            </div>

            {/* Title */}
            <div className="mt-4 h-5 w-2/3 rounded bg-slate-100" />

            {/* Description */}
            <div className="mt-3 h-4 w-full rounded bg-slate-100" />
            <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />

            {/* Footer */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="h-3 w-48 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
      
      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load complaints
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchComplaints}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        </div>
      )}


      {/* Complaint List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={22} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No complaints found
              </h3>

              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
  {search || statusFilter !== "ALL" || priorityFilter !== "ALL"
    ? "No complaints match your current search or filters."
    : role === "STUDENT"
      ? "You haven't submitted any maintenance complaints yet."
      : role === "WARDEN"
        ? "No complaints are currently available for your hostel."
        : role === "ADMIN"
          ? "No complaints are currently available in the system."
          : "No complaints found."}
</p>

              {(search || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("")
                    setStatusFilter("ALL")
                    setPriorityFilter("ALL")
                }}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                Clear filters
              </button>
            )}

            {role === "STUDENT" &&
  !search &&
  statusFilter === "ALL" &&
  priorityFilter === "ALL" && (
                <button
                  type="button"
                  onClick={() => navigate("/complaints/new")}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Plus size={16} />
                    Create your first complaint
                </button>
              )}
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  {/* Main content */}
                  <div className="min-w-0 flex-1">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">
                        #{complaint.id}
                      </span>

                      <Badge variant={getPriorityVariant(complaint.priority)}>
                        {complaint.priority}
                      </Badge>

                      <Badge variant={getStatusVariant(complaint.status)}>
                        {complaint.status.replaceAll("_", " ")}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h2 className="mt-3 text-base font-semibold leading-6 text-slate-950 transition group-hover:text-indigo-600">
                      {complaint.title}
                    </h2>

                    {/* Description */}
                    <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {complaint.description}
                    </p>
                  </div>

                  {/* View details */}
                  <button
                    type="button"
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    View details
                    <span className="ml-2 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    Created{" "}
                    <span className="font-medium text-slate-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </span>

                  <span className="text-xs text-slate-400">
                    Updated{" "}
                    <span className="font-medium text-slate-500">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function CreateComplaint() {
  const navigate = useNavigate()

  const { user } = useAuth()
  const [form, setForm] = useState({
    room_id: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    category_id: "",
  })
  const handleChange = (event) => {
    const { name, value } = event.target

      setForm((current) => ({
        ...current,
        [name]: value,
    }))
  }

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [roomLoading, setRoomLoading] = useState(true)
  const [roomError, setRoomError] = useState("")

  const handleSubmit = async () => {
    setSubmitError("")

    if (!form.title.trim()) {
      setSubmitError("Please enter a complaint title.")
      return
    }

    if (!form.description.trim()) {
      setSubmitError("Please describe the issue.")
      return
    }

    if (!form.room_id) {
      setSubmitError("Your room assignment could not be found.")
      return
    }

    if (!form.category_id) {
      setSubmitError("Please select a category.")
      return
    }

    try {
      setSubmitting(true)

      const complaint = await createComplaint({
        room_id: Number(form.room_id),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category_id: Number(form.category_id),
      })

      navigate(`/complaints/${complaint.id}`)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchStudentRoom = async () => {
      try {
        setRoomLoading(true)
        setRoomError("")

        const assignments = await getRoomAssignments()

        const activeAssignment = assignments.find(
          (assignment) =>
            assignment.user_id === user?.id &&
            assignment.is_active
        )

        if (!activeAssignment) {
          setRoomError("No active room assignment found.")
          return
        }

        setForm((current) => ({
          ...current,
          room_id: String(activeAssignment.room_id),
        }))
      } catch (error) {
        setRoomError(error.message)
      } finally {
        setRoomLoading(false)
      }
    }

    if (user?.id) {
      fetchStudentRoom()
    }
  }, [user?.id])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        setCategoriesError("")

        const data = await getComplaintCategories()

        setCategories(data)
      } catch (error) {
          setCategoriesError(error.message)
        } finally {
          setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])



  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/complaints")}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← Back to complaints
        </button>

        <p className="mt-6 text-sm font-medium text-indigo-600">
          Student workspace
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Report a maintenance issue
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Tell us what needs attention and we'll route your request to the
          appropriate maintenance team.
        </p>
      </div>

      {/* Assigned Room */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            🏠
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
              Assigned room
            </p>

            {roomLoading ? (
              <p className="mt-1 text-sm font-medium text-slate-500">
                Loading your room assignment...
              </p>
            ) : roomError ? (
              <p className="mt-1 text-sm font-medium text-red-600">
                {roomError}
              </p>
            ) : (
              <p className="mt-1 text-base font-semibold text-slate-900">
                Room #{form.room_id}
              </p>
            )}

            <p className="mt-1 text-xs text-slate-500">
              Your complaint will automatically be linked to this room.
            </p>
          </div>
        </div>
      </div>


      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6">

          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to submit complaint
                </p>

                <p className="mt-0.5 text-sm text-red-600">
                  {submitError}
                </p>
              </div>
            </div>
          )}


          {/* Title */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-slate-800"
              >
                What needs attention?
              </label>

              <span className="text-xs text-slate-400">
                {form.title.length}/100
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Give your complaint a short, specific title.
            </p>

            <input
              id="title"
              name="title"
              type="text"
              maxLength={100}
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Bathroom tap is leaking"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-800"
              >
                Describe the issue
              </label>

              <span className="text-xs text-slate-400">
                {form.description.length}/500
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Include useful details such as location, what happened, and when you
              noticed the problem.
            </p>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={500}
              rows={6}
              placeholder="Example: The bathroom tap has been leaking continuously since this morning. Water is collecting near the sink."
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                More detail helps the maintenance team resolve the issue faster.
              </p>

              <span
                className={`text-xs font-medium ${
                  form.description.length >= 450
                    ? "text-amber-600"
                    : "text-slate-400"
                  }`}
                >
                  {form.description.length >= 450
                    ? "Almost at limit"
                    : "Up to 500 characters"}
                </span>
              </div>
            </div>

          {/* Category + Priority */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-semibold text-slate-800"
              >
                Issue category
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Select the type of maintenance issue.
              </p>

              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                disabled={categoriesLoading}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select issue category"}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {categoriesError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {categoriesError}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-semibold text-slate-800"
              >
                Priority
              </label>

              <p className="mt-1 text-xs text-slate-500">
                How urgently does this issue need attention?
              </p>

              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              >
                <option value="LOW">Low — Can wait</option>
                <option value="MEDIUM">Medium — Needs attention</option>
                <option value="HIGH">High — Needs quick attention</option>
                <option value="CRITICAL">Critical — Urgent issue</option>
              </select>

              <p className="mt-2 text-xs text-slate-400">
                Use Critical only when the issue requires immediate attention.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
              <p className="text-sm font-medium text-slate-700">
                Ready to submit?
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Your complaint will be sent to the hostel maintenance team.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/complaints")}
                disabled={submitting}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  roomLoading ||
                  !!roomError ||
                  categoriesLoading ||
                  !!categoriesError
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                ) : (
                  <>
                    Submit complaint
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}


function Maintenance() {
  const [technicians, setTechnicians] = useState([])
  const [search, setSearch] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadTechnicians = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getTechnicians()
      setTechnicians(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTechnicians()
  }, [])

  const filteredTechnicians = technicians.filter((technician) => {
    const name = technician.name || ""
    const id = technician.id?.toString() || ""

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      id.includes(search)

    const isAvailable =
      technician.is_available ??
      technician.available ??
      true

    const matchesAvailability =
      availabilityFilter === "ALL" ||
      (availabilityFilter === "AVAILABLE" && isAvailable) ||
      (availabilityFilter === "UNAVAILABLE" && !isAvailable)

    return matchesSearch && matchesAvailability
  })

  const availableCount = technicians.filter((technician) => {
    return (
      technician.is_available ??
      technician.available ??
      true
    )
  }).length

  const unavailableCount = technicians.length - availableCount

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-semibold text-red-800">
          Unable to load maintenance team
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={loadTechnicians}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-7 shadow-sm sm:px-8">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-400">
            Maintenance
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Maintenance operations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Manage technician availability and monitor maintenance workload
            across your hostel operations.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-32 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
      </section>

      {/* Team KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total technicians
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {technicians.length}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Available
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
            {availableCount}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Unavailable
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-600">
            {unavailableCount}
          </p>
        </Card>
      </div>

      {/* Technician List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-950">
                Technician team
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View technician availability and current workload.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search technicians..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                />
              </div>

              <select
                value={availabilityFilter}
                onChange={(event) =>
                  setAvailabilityFilter(event.target.value)
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="ALL">All technicians</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {filteredTechnicians.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Wrench size={20} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No technicians found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or availability filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Technician
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Availability
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Workload
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTechnicians.map((technician) => {
                  const isAvailable =
                    technician.is_available ??
                    technician.available ??
                    true

                  const workload =
                    technician.workload ??
                    technician.active_complaints ??
                    technician.current_workload ??
                    0

                  return (
                    <tr
                      key={technician.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-600">
                            {technician.name
                              ?.charAt(0)
                              ?.toUpperCase() || "T"}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {technician.name ||
                                `Technician #${technician.id}`}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Technician #{technician.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isAvailable
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {workload}
                        </span>

                        <span className="ml-1 text-xs text-slate-400">
                          active
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-medium text-slate-400">
                          Team member
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}




function Analytics() {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()

  const [complaints, setComplaints] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadAnalytics() {
      try {
        setLoading(true)
        setError("")

        let complaintData = []
        let technicianData = []

        if (role === "TECHNICIAN") {
          complaintData = await getAssignedComplaints()
        } else if (role === "WARDEN" || role === "ADMIN") {
          const [allComplaints, allTechnicians] = await Promise.all([
            getComplaints(),
            getTechnicians(),
          ])
          complaintData = allComplaints
          technicianData = allTechnicians
        } else {
          complaintData = await getComplaints()
        }

        if (!cancelled) {
          setComplaints(Array.isArray(complaintData) ? complaintData : [])
          setTechnicians(Array.isArray(technicianData) ? technicianData : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load analytics.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (user) loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [user, role])

  const statusOf = (complaint) =>
    String(complaint.status || "").toUpperCase().replaceAll(" ", "_")

  const priorityOf = (complaint) =>
    String(complaint.priority || "").toUpperCase()

  const countStatus = (status) =>
    complaints.filter((item) => statusOf(item) === status).length

  const activeCount = complaints.filter(
    (item) => !["RESOLVED", "CLOSED"].includes(statusOf(item))
  ).length

  const completedCount = complaints.length - activeCount

  const highPriorityCount = complaints.filter((item) =>
    ["HIGH", "CRITICAL"].includes(priorityOf(item))
  ).length

  const priorities = [
    { label: "Critical", value: "CRITICAL", color: "bg-rose-500", dot: "#f43f5e" },
    { label: "High", value: "HIGH", color: "bg-orange-500", dot: "#f97316" },
    { label: "Medium", value: "MEDIUM", color: "bg-amber-500", dot: "#f59e0b" },
    { label: "Low", value: "LOW", color: "bg-emerald-500", dot: "#10b981" },
  ]

  const statuses = [
    { label: "Submitted", value: "SUBMITTED", color: "#64748b" },
    { label: "Acknowledged", value: "ACKNOWLEDGED", color: "#8b5cf6" },
    { label: "Assigned", value: "ASSIGNED", color: "#3b82f6" },
    { label: "In progress", value: "IN_PROGRESS", color: "#f59e0b" },
    { label: "Resolved", value: "RESOLVED", color: "#10b981" },
    { label: "Closed", value: "CLOSED", color: "#059669" },
    { label: "Reopened", value: "REOPENED", color: "#f43f5e" },
  ]

  const priorityCounts = priorities.map((item) => ({
    ...item,
    count: complaints.filter((c) => priorityOf(c) === item.value).length,
  }))

  const statusCounts = statuses.map((item) => ({
    ...item,
    count: countStatus(item.value),
  }))

  const maxPriority = Math.max(1, ...priorityCounts.map((item) => item.count))
  const maxStatus = Math.max(1, ...statusCounts.map((item) => item.count))

  const roleTitle =
    role === "ADMIN"
      ? "System analytics"
      : role === "WARDEN"
        ? "Hostel operations analytics"
        : role === "TECHNICIAN"
          ? "My work analytics"
          : "My complaint analytics"

  const completionRate = complaints.length
    ? Math.round((completedCount / complaints.length) * 100)
    : 0

  const activeRate = complaints.length
    ? Math.round((activeCount / complaints.length) * 100)
    : 0

  const donutStops = []
  let currentPercent = 0

  statusCounts.forEach((item) => {
    if (!item.count || !complaints.length) return

    const start = currentPercent
    currentPercent += (item.count / complaints.length) * 100
    donutStops.push(`${item.color} ${start}% ${currentPercent}%`)
  })

  const StatCard = ({ label, value, description, icon, accent }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  )

  const Panel = ({ title, subtitle, children }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="font-semibold text-rose-800">Unable to load analytics</h2>
        <p className="mt-2 text-sm text-rose-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Reports & insights
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            {roleTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Monitor complaints, identify urgent issues, and track maintenance progress.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live API data
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total complaints"
          value={complaints.length}
          description="Records returned by the API"
          accent="bg-indigo-50 text-indigo-600"
          icon={<ClipboardList size={22} />}
        />
        <StatCard
          label="Active complaints"
          value={activeCount}
          description="Includes reopened complaints"
          accent="bg-amber-50 text-amber-600"
          icon={<Clock3 size={22} />}
        />
        <StatCard
          label="Resolved / closed"
          value={completedCount}
          description="Completed complaint records"
          accent="bg-emerald-50 text-emerald-600"
          icon={<CheckCircle2 size={22} />}
        />
        <StatCard
          label="Technicians"
          value={role === "WARDEN" || role === "ADMIN" ? technicians.length : "—"}
          description={
            role === "WARDEN" || role === "ADMIN"
              ? "Technicians returned by the API"
              : "Not available for this role"
          }
          accent="bg-violet-50 text-violet-600"
          icon={<Wrench size={22} />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Priority distribution"
          subtitle="Understand how urgent your complaint queue is"
        >
          <div className="space-y-5">
            {priorityCounts.map((item) => {
              const percent = complaints.length
                ? Math.round((item.count / complaints.length) * 100)
                : 0

              return (
                <div key={item.value}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-slate-700">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.count}
                      <span className="ml-2 font-normal text-slate-400">{percent}%</span>
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${(item.count / maxPriority) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Urgent workload</p>
            <p className="mt-1 text-sm text-slate-500">
              {highPriorityCount} complaint{highPriorityCount === 1 ? "" : "s"} marked High or Critical.
            </p>
          </div>
        </Panel>

        <Panel
          title="Workflow overview"
          subtitle="Where complaints currently sit in the process"
        >
          <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center">
            <div
              className="relative h-44 w-44 shrink-0 rounded-full"
              style={{
                background: donutStops.length
                  ? `conic-gradient(${donutStops.join(", ")})`
                  : "#e2e8f0",
              }}
              role="img"
              aria-label={`Complaint status distribution across ${complaints.length} complaints`}
            >
              <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-950">
                  {complaints.length}
                </span>
                <span className="mt-1 text-xs text-slate-500">Complaints</span>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              {statusCounts.map((item) => (
                <div key={item.value} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-xs text-slate-600">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 space-y-4 border-t border-slate-100 pt-5">
            {statusCounts.map((item) => (
              <div key={item.value}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium tabular-nums text-slate-800">
                    {item.count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / maxStatus) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      
      
{(role === "WARDEN" || role === "ADMIN") && (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-6">
      <h2 className="font-semibold text-slate-950">
        Technician workload
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Compare assigned complaints with each technician's reported workload.
      </p>
    </div>

    {technicians.length === 0 ? (
      <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
        No technicians are available.
      </p>
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        {technicians.map((technician) => {
          const assignedCount = complaints.filter(
            (complaint) =>
              Number(complaint.assigned_technician_id) ===
              Number(technician.user_id)
          ).length

          const reportedWorkload = Number(technician.current_workload) || 0
          const workload = Math.max(assignedCount, reportedWorkload)
          const maxWorkload = Math.max(
            5,
            ...technicians.map((item) =>
              Math.max(Number(item.current_workload) || 0, 0)
            ),
            ...technicians.map((item) =>
              complaints.filter(
                (complaint) =>
                  Number(complaint.assigned_technician_id) ===
                  Number(item.user_id)
              ).length
            )
          )

          const availability = String(
            technician.availability_status || "UNKNOWN"
          ).toUpperCase()

          const isAvailable = availability === "AVAILABLE"

          return (
            <div
              key={technician.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {technician.employee_id || `Technician ${technician.id}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Technician ID: {technician.id}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isAvailable
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {availability.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                    Assigned complaints
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {assignedCount}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                    API workload
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {reportedWorkload}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs text-slate-500">
                  <span>Workload indicator</span>
                  <span>{workload}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      workload >= 5
                        ? "bg-orange-500"
                        : "bg-indigo-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (workload / maxWorkload) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </section>
)}

      <Panel
        title="Operational insights"
        subtitle="A quick summary of current complaint performance"
      >
        {complaints.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-700">No complaint data yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Insights will appear when complaint records are available.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Active share</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">{activeRate}%</p>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${activeRate}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Completion share</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{completionRate}%</p>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">High / critical</p>
              <p className="mt-2 text-2xl font-bold text-rose-600">{highPriorityCount}</p>
              <p className="mt-2 text-xs text-slate-500">Complaints needing attention</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Reopened</p>
              <p className="mt-2 text-2xl font-bold text-violet-600">
                {countStatus("REOPENED")}
              </p>
              <p className="mt-2 text-xs text-slate-500">Require follow-up</p>
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}



function Notifications() {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getNotifications()
        setNotifications(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      )
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        
<p className="text-sm font-medium text-indigo-600">
  {role === "TECHNICIAN"
    ? "Technician workspace"
    : role === "WARDEN"
      ? "Warden workspace"
      : role === "ADMIN"
        ? "Admin workspace"
        : "Student workspace"}
</p>

        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Notifications
            </h1>

            
<p className="mt-2 text-sm leading-6 text-slate-500">
  {role === "TECHNICIAN"
    ? "Stay updated on your assigned complaints and maintenance work."
    : role === "WARDEN"
      ? "Stay updated on complaint assignments and maintenance operations."
      : role === "ADMIN"
        ? "Stay updated on system activity and complaint operations."
        : "Stay updated on your complaints and maintenance requests."}
</p>
          </div>

          {!loading && notifications.length > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              {unreadCount} unread
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            Unable to load notifications
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Bell className="h-5 w-5 text-slate-500" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            You're all caught up
          </h2>

          
<p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
  {role === "TECHNICIAN"
    ? "Updates about assigned complaints and maintenance work will appear here."
    : role === "WARDEN"
      ? "Updates about complaint assignments and maintenance operations will appear here."
      : role === "ADMIN"
        ? "Updates about system activity and complaint operations will appear here."
        : "New updates about your complaints and maintenance requests will appear here."}
</p>
        </div>
      )}

      {/* Notifications */}
      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                notification.is_read
                  ? "border-slate-200"
                  : "border-indigo-200 bg-indigo-50/30"
              }`}
            >
              <div className="flex gap-4">
                {/* Status indicator */}
                <div className="pt-1">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      notification.is_read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-sm font-semibold ${
                          notification.is_read
                            ? "text-slate-800"
                            : "text-slate-950"
                        }`}
                      >
                        {notification.title}
                      </h2>

                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </div>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>

                  {!notification.is_read && (
                    <div className="mt-3 flex items-center gap-3">
                      <Badge variant="info">Unread</Badge>

                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs font-medium text-indigo-600 transition hover:text-indigo-800"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const role = profile?.role?.toUpperCase()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getMyProfile()

console.log("Profile API response:", data.user)

setProfile(data.user)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        
<p className="text-sm font-medium uppercase tracking-wider text-indigo-600">
  {role === "STUDENT"
    ? "Student workspace"
    : role === "TECHNICIAN"
      ? "Technician workspace"
      : role === "WARDEN"
        ? "Warden workspace"
        : role === "ADMIN"
          ? "Admin workspace"
          : "Account"}
</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Profile
        </h1>
        
<p className="mt-2 text-sm text-slate-500">
  {role === "STUDENT"
    ? "View your personal information and account details."
    : role === "TECHNICIAN"
      ? "View your account information and technician details."
      : role === "WARDEN"
        ? "View your account information and hostel operations role."
        : role === "ADMIN"
          ? "View your account information and administrator access."
          : "Manage and view your HostelOps account information."}
</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-semibold text-indigo-600">
            {profile.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {profile.name}
            </h2>
            <p className="text-sm text-slate-500">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="grid gap-6 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Full name
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {profile.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Email
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {profile.email}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Phone
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {profile.phone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Role
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {profile.role?.charAt(0).toUpperCase() +
                profile.role?.slice(1).toLowerCase()}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              User ID
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              #{profile.id}
            </p>
          </div>

          
<div>
  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
    Account status
  </p>
  <p className="mt-1 text-sm font-medium text-slate-500">
    {typeof profile.is_active === "boolean"
      ? profile.is_active
        ? "Active"
        : "Inactive"
      : "Not available"}
  </p>
</div>
        </div>
      </div>
    </div>
  )
}



function ComplaintDetails() {
  const { complaintId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [rooms, setRooms] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [techniciansLoading, setTechniciansLoading] = useState(false)
  const [techniciansError, setTechniciansError] = useState("")
  const [selectedTechnician, setSelectedTechnician] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [assignmentError, setAssignmentError] = useState("")
  const [assignmentSuccess, setAssignmentSuccess] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusError, setStatusError] = useState("")
  const [statusSuccess, setStatusSuccess] = useState("")
  
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getComplaint(complaintId)

        setComplaint(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaint()
  }, [complaintId])

  useEffect(() => {
    const fetchHistory = async () => {
      console.log("Fetching history for complaint:", complaintId)

      try {
        setHistoryLoading(true)

        const data = await getComplaintHistory(complaintId)

        console.log("History API response:", data)

        setHistory(data)
      } catch (error) {
        console.error("History API error:", error)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [complaintId])

  useEffect(() => {
  const fetchDetails = async () => {
    try {
      const role = user?.role?.toUpperCase()

      const [categoryData, roomData] =
        await Promise.all([
          getComplaintCategories(),
          getRooms(),
        ])

      setCategories(categoryData)
      setRooms(roomData)

      if (role === "WARDEN") {
        setTechniciansLoading(true)
        setTechniciansError("")

        const technicianData = await getTechnicians()

        setTechnicians(technicianData)
      }
    } catch (error) {
      console.error("Details lookup error:", error)

      if (user?.role?.toUpperCase() === "WARDEN") {
        setTechniciansError(error.message)
      }
    } finally {
      setTechniciansLoading(false)
    }
  }

  if (user) {
    fetchDetails()
  }
}, [user])

  const getStatusVariant = (status) => {
    if (status === "RESOLVED" || status === "CLOSED") {
      return "success"
    }

    if (status === "REOPENED") {
      return "danger"
    }

    if (status === "IN_PROGRESS" || status === "ASSIGNED") {
      return "info"
    }

    if (status === "ACKNOWLEDGED") {
      return "warning"
    }

    return "default"
  }

  const getPriorityVariant = (priority) => {
    if (priority === "CRITICAL") {
      return "danger"
    }

    if (priority === "HIGH") {
      return "warning"
    }

    if (priority === "MEDIUM") {
      return "info"
    }

    return "default"
  }

  const handleAssignTechnician = async () => {
  if (!selectedTechnician) {
    setAssignmentError("Please select a technician.")
    return
  }

  try {
    setAssigning(true)
    setAssignmentError("")
    setAssignmentSuccess("")

    await assignComplaint(
      complaintId,
      selectedTechnician
    )

    setAssignmentSuccess(
      "Technician assigned successfully."
    )

    const [updatedComplaint, updatedHistory] =
      await Promise.all([
        getComplaint(complaintId),
        getComplaintHistory(complaintId),
      ])

    setComplaint(updatedComplaint)
    setHistory(updatedHistory)
    setSelectedTechnician("")
  } catch (error) {
    setAssignmentError(error.message)
  } finally {
    setAssigning(false)
  }
}


const handleUpdateStatus = async () => {
  if (!selectedStatus) {
    setStatusError("Please select a new status.")
    return
  }

  try {
    setUpdatingStatus(true)
    setStatusError("")
    setStatusSuccess("")

    await updateComplaintStatus(
      complaintId,
      selectedStatus
    )

    setStatusSuccess("Complaint status updated successfully.")

    const [updatedComplaint, updatedHistory] =
      await Promise.all([
        getComplaint(complaintId),
        getComplaintHistory(complaintId),
      ])

    setComplaint(updatedComplaint)
    setHistory(updatedHistory)
    setSelectedStatus("")
  } catch (error) {
    setStatusError(error.message)
  } finally {
    setUpdatingStatus(false)
  }
}

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Loading complaint...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        {error}
      </div>
    )
  }

  if (!complaint) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/complaints")}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">
          ←
        </span>

          Back to complaints
        </button>

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Complaint #{complaint.id}
            </span>

            <Badge variant={getPriorityVariant(complaint.priority)}>
              {complaint.priority}
            </Badge>

            <Badge variant={getStatusVariant(complaint.status)}>
              {complaint.status.replaceAll("_", " ")}
            </Badge>
          </div>

          <h1 className="mt-4 max-w-4xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {complaint.title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {complaint.description}
          </p>
        </div>

        <div className="shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Last updated
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {new Date(complaint.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>


      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Need to follow up on this complaint?
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Review the latest status and activity before taking further action.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Refresh status
        </button>
      </div>


      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Status
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {complaint.status.replaceAll("_", " ")}
          </p>
        </div>

        {/* Complaint information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
              Details
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Complaint information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Key information associated with this maintenance request.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <DoorOpen size={18} />
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Room
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {rooms.find((room) => room.id === complaint.room_id)?.room_number ||
                  `Room #${complaint.room_id}`}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Tag size={18} />
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Category
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {categories.find(
                  (category) => category.id === complaint.category_id
                )?.name || `Category #${complaint.category_id}`}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Wrench size={18} />
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Technician
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {complaint.assigned_technician_name || "Not assigned"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <CalendarDays size={18} />
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Created
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {new Date(complaint.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <RefreshCw size={18} />
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Updated
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {new Date(complaint.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Priority
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {complaint.priority}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Last updated
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {new Date(complaint.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {/* Warden Assignment */}
    {user?.role?.toUpperCase() === "WARDEN" &&
      !["RESOLVED", "CLOSED"].includes(complaint.status) && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
              Maintenance
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              Technician assignment
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Assign this complaint to a technician based on availability,
              workload, and required skills.
            </p>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <Wrench size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Ready for assignment
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Select a technician to take responsibility for this complaint.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="technician"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Technician
                </label>

                <select
                  id="technician"
                  value={selectedTechnician}
                  onChange={(event) => {
                    setSelectedTechnician(event.target.value)
                    setAssignmentError("")
                    setAssignmentSuccess("")
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="" disabled>
                    Select a technician
                  </option>

                  {techniciansLoading ? (
                    <option value="" disabled>
                      Loading technicians...
                    </option>
                  ) : techniciansError ? (
                    <option value="" disabled>
                      Unable to load technicians
                    </option>
                  ) : technicians.length === 0 ? (
                    <option value="" disabled>
                      No technicians available
                    </option>
                  ) : (
                    technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.name || `Technician #${technician.id}`}
                    </option>
                  ))
                )}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAssignTechnician}
                disabled={assigning || !selectedTechnician}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                <Wrench size={16} />
                  Assign technician
                </>
              )}
            </button>
            </div>

            {assignmentError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {assignmentError}
              </p>
            )}

            {assignmentSuccess && (
              <p className="mt-3 text-sm font-medium text-emerald-600">
                {assignmentSuccess}
              </p>
            )}

          </div>
        </section>
      )}



      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Activity
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Complaint history
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track how this complaint has progressed.
          </p>
        </div>

        {historyLoading ? (
          <div className="mt-8 space-y-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-4">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            No activity recorded yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Status changes will appear here as the complaint progresses.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          {history.map((item, index) => {
            const isLatest = index === history.length - 1

            return (
              <div key={item.id} className="relative flex gap-4">
                {!isLatest && (
                  <div className="absolute left-[15px] top-9 h-[calc(100%-20px)] w-px bg-slate-200" />
                )}

                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    isLatest
                    ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                    : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isLatest ? "bg-indigo-500" : "bg-slate-300"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1 pb-8">
                  <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      isLatest ? "text-slate-950" : "text-slate-800"
                    }`}
                  >
                    {item.new_status?.replaceAll("_", " ")}
                  </span>

                  {isLatest && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                      Current
                    </span>
                  )}
                </div>

                {item.old_status && (
                  <p className="mt-1 text-sm text-slate-500">
                    Status changed from{" "}
                    <span className="font-medium text-slate-700">
                      {item.old_status.replaceAll("_", " ")}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-slate-700">
                      {item.new_status?.replaceAll("_", " ")}
                    </span>
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  {item.changed_at && (
                    <span>
                      {new Date(item.changed_at).toLocaleString()}
                    </span>
                  )}

                  {item.changed_by && (
                    <span>
                      Updated by user #{item.changed_by}
                    </span>
                  )}
                </div>

                {item.note && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs font-medium text-slate-500">
                      Note
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {item.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )}

    {/* Technician Status Actions */}
{user?.role?.toUpperCase() === "TECHNICIAN" &&
  !["CLOSED"].includes(complaint.status) && (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
          Maintenance
        </p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
          Update complaint
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Update the complaint status as you work on the maintenance request.
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <Wrench size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Current status
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {complaint.status.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              New status
            </label>

            <select
              id="status"
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value)
                setStatusError("")
                setStatusSuccess("")
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="" disabled>
                Select new status
              </option>

              {complaint.status === "ASSIGNED" && (
                <option value="IN_PROGRESS">
                  In progress
                </option>
              )}

              {complaint.status === "IN_PROGRESS" && (
                <option value="RESOLVED">
                  Resolved
                </option>
              )}

              {complaint.status === "REOPENED" && (
                <option value="IN_PROGRESS">
                  In progress
                </option>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={handleUpdateStatus}
            disabled={updatingStatus || !selectedStatus}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updatingStatus ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
              Updating...
          </>
        ) : (
          <>
          <CheckCircle2 size={16} />
            Update status
          </>
        )}
      </button>
        </div>

        {statusError && (
          <p className="mt-3 text-sm font-medium text-red-600">
            {statusError}
          </p>
        )}

        {statusSuccess && (
          <p className="mt-3 text-sm font-medium text-emerald-600">
            {statusSuccess}
          </p>
        )}

      </div>
    </section>
  )}

      </div>

    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route path="/" element={<RoleBasedDashboard />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaints/new" element={<CreateComplaint />} />
          <Route path="/complaints/:complaintId" element={<ComplaintDetails />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/assigned-complaints" element={<AssignedComplaints />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

    </Routes>
  )
}

export default AppRoutes