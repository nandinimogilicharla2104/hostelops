import { useEffect, useMemo, useState } from "react"
import {
  Users,
  Wrench,
  FileText,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react"

import Card from "../components/ui/Card"
import Badge from "../components/ui/Badge"

import {
  getComplaints,
  getTechnicians,
} from "../services/api"

const statusVariant = {
  SUBMITTED: "default",
  ACKNOWLEDGED: "info",
  ASSIGNED: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "success",
  REOPENED: "danger",
}

const priorityVariant = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
}

function AdminDashboard() {
  const [complaints, setComplaints] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError("")

      const [complaintsData, techniciansData] =
        await Promise.all([
          getComplaints(),
          getTechnicians(),
        ])

      setComplaints(complaintsData)
      setTechnicians(techniciansData)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const active = complaints.filter(
      (complaint) =>
        !["RESOLVED", "CLOSED"].includes(
          complaint.status
        )
    ).length

    const resolved = complaints.filter(
      (complaint) =>
        ["RESOLVED", "CLOSED"].includes(
          complaint.status
        )
    ).length

    const highPriority = complaints.filter(
      (complaint) =>
        ["HIGH", "CRITICAL"].includes(
          complaint.priority
        )
    ).length

    const availableTechnicians =
      technicians.filter(
        (technician) =>
          technician.is_available ??
          technician.available ??
          true
      ).length

    return {
      totalComplaints: complaints.length,
      active,
      resolved,
      highPriority,
      totalTechnicians: technicians.length,
      availableTechnicians,
    }
  }, [complaints, technicians])

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort(
        (a, b) =>
          new Date(b.updated_at) -
          new Date(a.updated_at)
      )
      .slice(0, 5)
  }, [complaints])

  const statusCounts = useMemo(() => {
    const counts = {}

    complaints.forEach((complaint) => {
      counts[complaint.status] =
        (counts[complaint.status] || 0) + 1
    })

    return counts
  }, [complaints])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-4 h-9 w-72 rounded bg-slate-200" />
          <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Card
              key={item}
              className="animate-pulse p-5"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-28 rounded bg-slate-100" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <Activity className="h-3.5 w-3.5" />
            Admin workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Operations overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor hostel operations, maintenance workload,
            and system activity from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </section>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="font-semibold text-red-800">
                Unable to load admin data
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Total complaints
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {stats.totalComplaints}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Across the system
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Active complaints
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {stats.active}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Currently requiring action
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Technicians
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {stats.totalTechnicians}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {stats.availableTechnicians} available now
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                High priority
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {stats.highPriority}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                High or critical complaints
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </section>

      {/* Main Analytics */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Status Distribution */}
        <Card className="p-6 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Complaint status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current distribution
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {Object.entries(statusCounts).length === 0 ? (
              <p className="text-sm text-slate-500">
                No complaints available.
              </p>
            ) : (
              Object.entries(statusCounts).map(
                ([status, count]) => {
                  const percentage =
                    complaints.length > 0
                      ? Math.round(
                          (count /
                            complaints.length) *
                            100
                        )
                      : 0

                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              statusVariant[status] ||
                              "default"
                            }
                          >
                            {status.replace("_", " ")}
                          </Badge>
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {count}
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                }
              )
            )}
          </div>
        </Card>

        {/* Recent Complaints */}
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Recent complaints
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest maintenance activity
              </p>
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Latest 5
            </span>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {recentComplaints.length === 0 ? (
              <div className="py-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No complaints yet
                </p>
              </div>
            ) : (
              recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        #{complaint.id}
                      </span>

                      <Badge
                        variant={
                          priorityVariant[
                            complaint.priority
                          ] || "default"
                        }
                      >
                        {complaint.priority}
                      </Badge>

                      <Badge
                        variant={
                          statusVariant[
                            complaint.status
                          ] || "default"
                        }
                      >
                        {complaint.status?.replace(
                          "_",
                          " "
                        )}
                      </Badge>
                    </div>

                    <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                      {complaint.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-xs text-slate-400">
                      Updated
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {new Date(
                        complaint.updated_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      {/* System Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-950">
              System health snapshot
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current operational availability.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Technician availability
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-950">
              {stats.totalTechnicians > 0
                ? Math.round(
                    (stats.availableTechnicians /
                      stats.totalTechnicians) *
                      100
                  )
                : 0}
              %
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Resolution rate
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-950">
              {stats.totalComplaints > 0
                ? Math.round(
                    (stats.resolved /
                      stats.totalComplaints) *
                      100
                  )
                : 0}
              %
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Active workload
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-950">
              {stats.active}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard