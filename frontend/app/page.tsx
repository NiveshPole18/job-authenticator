"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import axios from "axios"
import { io } from "socket.io-client"
import JobTable from "@/components/JobTable"
import FilterBar from "@/components/FilterBar"
import Toast from "@/components/Toast"
import Navigation from "@/components/Navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export default function Dashboard() {
  // Use a typed filter state
  const [filters, setFilters] = useState<{ status: string; priority: string; search: string; sort: string; limit: number; offset: number }>({
    status: "",
    priority: "",
    search: "",
    sort: "createdAt:desc",
    limit: 20,
    offset: 0,
  })
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [realTimeUpdates, setRealTimeUpdates] = useState<Record<string, any>>({})

  // Fix: UseMemo to memoize query string and avoid stale closures, unnecessary re-renders
  const jobsApiUrl = useMemo(() => {
    const queryParams = new URLSearchParams()
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.priority) queryParams.append("priority", filters.priority)
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.sort) queryParams.append("sort", filters.sort)
    queryParams.append("limit", filters.limit.toString())
    queryParams.append("offset", filters.offset.toString())
    return `${API_URL}/jobs?${queryParams.toString()}`
  }, [filters])

  // Add error catch to handle errors from backend
  const { data, mutate, isLoading, error } = useSWR(jobsApiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on("job:created", (job) => {
      setRealTimeUpdates((prev) => ({ ...prev, [job.id]: job }))
      mutate()
    })

    socket.on("job:started", (job) => {
      setRealTimeUpdates((prev) => ({ ...prev, [job.id]: job }))
    })

    socket.on("job:completed", (job) => {
      setRealTimeUpdates((prev) => ({ ...prev, [job.id]: job }))
      setToast({ message: `Job "${job.taskName}" completed!`, type: "success" })
    })

    socket.on("job:failed", (job) => {
      setRealTimeUpdates((prev) => ({ ...prev, [job.id]: job }))
      setToast({ message: `Job "${job.taskName}" failed!`, type: "error" })
    })

    // Polling fallback
    const pollInterval = setInterval(() => {
      mutate()
    }, 5000)

    return () => {
      socket.disconnect()
      clearInterval(pollInterval)
    }
  }, [mutate])

  // Defensive: Only allow offset >= 0, limit positive, sort not empty, etc.
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      offset: 0,
      limit: Math.max(1, newFilters.limit ?? prev.limit),
      sort: newFilters.sort ?? (prev.sort || "createdAt:desc"),
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
