import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  ArrowUpDown,
  AlertCircle,
  ClipboardList,
} from "lucide-react"

import {
  getAssignedComplaints,
  updateComplaintStatus,
} from "../services/api"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

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

const priorityRank = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

function AssignedComplaints() {
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState("UPDATED_DESC")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState(null)

  const loadComplaints = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getAssignedComplaints()
      setComplaints(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const handleQuickStatusUpdate = async (
  event,
  complaintId,
  nextStatus
) => {
  event.stopPropagation()

  try {
    setUpdatingId(complaintId)
    setError("")

    await updateComplaintStatus(
      complaintId,
      nextStatus
    )

    await loadComplaints()
  } catch (error) {
    setError(error.message)
  } finally {
    setUpdatingId(null)
  }
}


  const filteredComplaints = useMemo(() => {
    return [...complaints]
      .filter((complaint) => {
        const searchText = search.toLowerCase()

        const matchesSearch =
          complaint.title?.toLowerCase().includes(searchText) ||
          complaint.description?.toLowerCase().includes(searchText)

        const matchesStatus =
          statusFilter === "ALL" ||
          complaint.status === statusFilter

        const matchesPriority =
          priorityFilter === "ALL" ||
          complaint.priority === priorityFilter

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        )
      })
      .sort((a, b) => {
        if (sortBy === "UPDATED_DESC") {
          return (
            new Date(b.updated_at) -
            new Date(a.updated_at)
          )
        }

        if (sortBy === "CREATED_DESC") {
          return (
            new Date(b.created_at) -
            new Date(a.created_at)
          )
        }

        if (sortBy === "CREATED_ASC") {
          return (
            new Date(a.created_at) -
            new Date(b.created_at)
          )
        }

        if (sortBy === "PRIORITY") {
          return (
            (priorityRank[b.priority] || 0) -
            (priorityRank[a.priority] || 0)
          )
        }

        return 0
      })
  }, [
    complaints,
    search,
    statusFilter,
    priorityFilter,
    sortBy,
  ])

  const activeCount = complaints.filter(
    (complaint) =>
      complaint.status !== "RESOLVED" &&
      complaint.status !== "CLOSED"
  ).length

  const highPriorityCount = complaints.filter(
    (complaint) =>
      complaint.priority === "HIGH" ||
      complaint.priority === "CRITICAL"
  ).length

  const resolvedCount = complaints.filter(
    (complaint) =>
      complaint.status === "RESOLVED" ||
      complaint.status === "CLOSED"
  ).length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <ClipboardList className="h-3.5 w-3.5" />
            Technician workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Assigned complaints
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review and manage maintenance requests currently
            assigned to you.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadComplaints}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Total assigned
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {complaints.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Current workload
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Active
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {activeCount}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Need attention
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            High priority
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {highPriorityCount}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            High or critical
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Resolved
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {resolvedCount}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Completed requests
          </p>
        </Card>
      </section>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search assigned complaints..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-11 min-w-44 appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="ALL">All statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="REOPENED">Reopened</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
            className="h-11 min-w-40 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">All priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="h-11 min-w-48 appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="UPDATED_DESC">
                Recently updated
              </option>

              <option value="CREATED_DESC">
                Newest first
              </option>

              <option value="CREATED_ASC">
                Oldest first
              </option>

              <option value="PRIORITY">
                Highest priority
              </option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="font-semibold text-red-800">
                Could not load assigned complaints
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                onClick={loadComplaints}
                className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="animate-pulse p-6"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-100" />
              <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Maintenance requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredComplaints.length} request
                {filteredComplaints.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <ClipboardList className="h-5 w-5 text-slate-500" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No assigned complaints found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try changing your search or filters. New
                assignments will appear here automatically.
              </p>
            </Card>
          ) : (
            filteredComplaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="group cursor-pointer p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                onClick={() =>
                  navigate(
                    `/complaints/${complaint.id}`
                  )
                }
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
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

                    <h3 className="mt-3 truncate text-base font-semibold text-slate-950 group-hover:text-indigo-600">
                      {complaint.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-left lg:text-right">
                    <p className="text-xs font-medium text-slate-400">
                      Last updated
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {new Date(
                        complaint.updated_at
                      ).toLocaleDateString()}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 lg:justify-end">
                        {complaint.status === "ASSIGNED" && (
                            <button
                                type="button"
                                disabled={updatingId === complaint.id}
                                onClick={(event) =>
                                    handleQuickStatusUpdate(
                                        event,
                                        complaint.id,
                                        "IN_PROGRESS"
                                    )
                                }
                                className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updatingId === complaint.id
                                    ? "Updating..."
                                    : "Start work"}
                                </button>
                            )}

                            {complaint.status === "IN_PROGRESS" && (
                                <button
                                    type="button"
                                    disabled={updatingId === complaint.id}
                                    onClick={(event) =>
                                        handleQuickStatusUpdate(
                                            event,
                                            complaint.id,
                                            "RESOLVED"
                                        )
                                    }
                                    className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updatingId === complaint.id
                                        ? "Updating..."
                                        : "Mark resolved"}
                                    </button>
                                )}

                                    {complaint.status === "REOPENED" && (
                                    <button
                                        type="button"
                                        disabled={updatingId === complaint.id}
                                        onClick={(event) =>
                                            handleQuickStatusUpdate(
                                                event,
                                                complaint.id,
                                                "IN_PROGRESS"
                                            )
                                        }
                                        className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updatingId === complaint.id
                                            ? "Updating..."
                                            : "Resume work"}
                                        </button>
                                    )}

                                    <span className="inline-flex text-sm font-semibold text-indigo-600">
                                        View details →
                                    </span>
                                </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </section>
      )}
    </div>
  )
}

export default AssignedComplaints