"use client"

import { useState } from "react"
import axios from "axios"
import JobCard from "./JobCard"
import Toast from "./Toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Job {
  id: number
  taskName: string
  priority: string
  status: string
  attempts: number
  createdAt: string
  updatedAt: string
  runDurationMs?: number
}

interface Props {
  jobs: Job[]
  total: number
  isLoading: boolean
  filters: any
  onFiltersChange: (filters: any) => void
  onJobRefresh: () => void
}

export default function JobTable({ jobs, total, isLoading, filters, onFiltersChange, onJobRefresh }: Props) {
  const [runningJobs, setRunningJobs] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const handleRunJob = async (jobId: number) => {
    setRunningJobs((prev) => new Set(prev).add(jobId))
    try {
      await axios.post(`${API_URL.replace(/\/$/, "")}/run-job/${jobId}`)
      setToast({ message: "Job started!", type: "success" })
      setTimeout(() => onJobRefresh(), 1000)
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || "Failed to run job", type: "error" })
    } finally {
      setRunningJobs((prev) => {
        const updated = new Set(prev)
        updated.delete(jobId)
        return updated
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "running":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "completed":
        return "bg-green-50 border-green-200 text-green-800"
      case "failed":
        return "bg-red-50 border-red-200 text-red-800"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600"
      case "Medium":
        return "text-orange-600"
      case "Low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <>
      <div className="bg-white border border-lavender-200 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="text-sm text-lavender-700">Sortable columns:</div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              onFiltersChange({
                ...filters,
                sort: filters.sort === "createdAt:desc" ? "createdAt:asc" : "createdAt:desc",
              })
            }
            className="px-3 py-1 text-sm bg-lavender-100 text-lavender-700 rounded hover:bg-lavender-200"
          >
            Created {filters.sort === "createdAt:desc" ? "↓" : "↑"}
          </button>
          <button
            onClick={() =>
              onFiltersChange({
                ...filters,
                sort: filters.sort === "priority:desc" ? "priority:asc" : "priority:desc",
              })
            }
            className="px-3 py-1 text-sm bg-lavender-100 text-lavender-700 rounded hover:bg-lavender-200"
          >
            Priority {filters.sort?.startsWith("priority") ? (filters.sort === "priority:desc" ? "↓" : "↑") : ""}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <div key={job.id} className="animate-scale-in">
            <JobCard
              job={job}
              isRunning={runningJobs.has(job.id)}
              onRun={() => handleRunJob(job.id)}
              statusColor={getStatusColor(job.status)}
              priorityColor={getPriorityColor(job.priority)}
            />
          </div>
        ))}
      </div>

      {jobs.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg border border-lavender-200">
          <p className="text-lavender-600">No jobs found</p>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-lavender-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between items-center">
        <p className="text-lavender-600">
          Showing {jobs.length} of {total} jobs
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onFiltersChange({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
            disabled={filters.offset === 0}
            className="px-4 py-2 bg-lavender-600 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, offset: filters.offset + filters.limit })}
            disabled={filters.offset + filters.limit >= total}
            className="px-4 py-2 bg-lavender-600 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
