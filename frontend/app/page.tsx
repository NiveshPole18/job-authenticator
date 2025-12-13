"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import axios from "axios"
import { io, Socket } from "socket.io-client"
// Avoiding path alias for compatibility with environments not supporting tsconfig paths
import JobTable from "../components/JobTable"
import FilterBar from "../components/FilterBar"
import Toast from "../components/Toast"
import Navigation from "../components/Navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

type FilterState = {
  status: string
  priority: string
  search: string
  sort: string
  limit: number
  offset: number
}

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    priority: "",
    search: "",
    sort: "createdAt:desc",
    limit: 20,
    offset: 0,
  })
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [realTimeUpdates, setRealTimeUpdates] = useState<Record<string, any>>({})

  // Memoize API URL to avoid unnecessary SWR fetches
  const jobsApiUrl = useMemo(() => {
    const queryParams = new URLSearchParams()
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.priority) queryParams.append("priority", filters.priority)
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.sort) queryParams.append("sort", filters.sort)
    queryParams.append("limit", `${filters.limit}`)
    queryParams.append("offset", `${filters.offset}`)
    return `${API_URL}/jobs?${queryParams.toString()}`
  }, [filters])

  const { data, mutate, isLoading, error } = useSWR(jobsApiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    const handleJobCreated = (job: any) => {
      setRealTimeUpdates(prev => ({ ...prev, [job.id]: job }))
      mutate()
    }
    const handleJobStarted = (job: any) => {
      setRealTimeUpdates(prev => ({ ...prev, [job.id]: job }))
    }
    const handleJobCompleted = (job: any) => {
      setRealTimeUpdates(prev => ({ ...prev, [job.id]: job }))
      setToast({ message: `Job "${job.taskName}" completed!`, type: "success" })
      mutate() // Refresh after completion
    }
    const handleJobFailed = (job: any) => {
      setRealTimeUpdates(prev => ({ ...prev, [job.id]: job }))
      setToast({ message: `Job "${job.taskName}" failed!`, type: "error" })
      mutate() // Refresh after failure
    }

    socket.on("job:created", handleJobCreated)
    socket.on("job:started", handleJobStarted)
    socket.on("job:completed", handleJobCompleted)
    socket.on("job:failed", handleJobFailed)

    const pollInterval = setInterval(() => {
      mutate()
    }, 5000)

    return () => {
      socket.off("job:created", handleJobCreated)
      socket.off("job:started", handleJobStarted)
      socket.off("job:completed", handleJobCompleted)
      socket.off("job:failed", handleJobFailed)
      socket.disconnect()
      clearInterval(pollInterval)
    }
  }, [mutate])

  // Always ensure offset is non-negative, limit is positive, sort is always set
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0,
      limit: Math.max(1, typeof newFilters.limit === "number" ? newFilters.limit : prev.limit),
      sort: (newFilters.sort ?? prev.sort) || "createdAt:desc"
    }))
  }

  // Defensive: Only accept valid jobs
  const jobs = Array.isArray(data?.jobs) ? data.jobs : []
  const total = typeof data?.total === "number" ? data.total : 0

  return (
    <main>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-lavender-900 mb-2">Job Scheduler Dashboard</h1>
          <p className="text-lavender-600">Monitor and manage automated tasks</p>
        </div>
        <FilterBar onFilterChange={handleFilterChange} />
        <div className="mt-8 animate-slide-up">
          <JobTable
            jobs={jobs.map((job: any) => ({ ...job, ...(realTimeUpdates[job.id] || {}) }))}
            total={total}
            isLoading={isLoading}
            filters={filters}
            onFiltersChange={setFilters}
            onJobRefresh={mutate}
          />
        </div>
        {error && (
          <div className="mt-4 text-red-600" role="alert">
            {error?.message || "Failed to load jobs"}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}
