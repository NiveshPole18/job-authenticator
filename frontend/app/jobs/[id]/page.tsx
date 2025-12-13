"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import axios from "axios"
// Avoid path aliases for compatibility and linting issues
import JobDetailView from "../../../components/JobDetailView"
import Navigation from "../../../components/Navigation"
import { io } from "socket.io-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export default function JobDetailPage() {
  const params = useParams()
  // Defensive: handle both object and array param results
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id

  const { data, mutate, isLoading, error } = useSWR(
    jobId ? `${API_URL}/jobs/${jobId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (!jobId) return
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
    })

    const handleJobUpdated = (updatedJob: any) => {
      if (updatedJob?.id?.toString() === jobId.toString()) {
        mutate()
      }
    }

    socket.on("job:updated", handleJobUpdated)

    const interval = setInterval(() => {
      mutate()
    }, 3000)

    return () => {
      socket.off("job:updated", handleJobUpdated)
      socket.disconnect()
      clearInterval(interval)
    }
    // It's safe for mutate and jobId to be dependencies here
  }, [mutate, jobId])

  if (isLoading) {
    return (
      <main>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse h-96 bg-lavender-100 rounded-lg" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-red-600" role="alert">
            Failed to load job details{error?.message ? `: ${error.message}` : ""}
          </div>
        </div>
      </main>
    )
  }

  if (!data?.job) {
    return (
      <main>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-gray-600" role="alert">
            Job not found.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <JobDetailView job={data.job} webhookLogs={data.webhookLogs || []} />
      </div>
    </main>
  )
}
