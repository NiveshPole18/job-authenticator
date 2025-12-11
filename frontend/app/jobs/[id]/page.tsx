"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import axios from "axios"
import { io } from "socket.io-client"
import JobDetailView from "@/components/JobDetailView"
import Navigation from "@/components/Navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string

  const { data, mutate, isLoading } = useSWR(`${API_URL}/jobs/${jobId}`, fetcher, { revalidateOnFocus: false })

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000")

    socket.on("job:updated", () => {
      mutate()
    })

    const interval = setInterval(() => {
      mutate()
    }, 3000)

    return () => {
      socket.disconnect()
      clearInterval(interval)
    }
  }, [mutate])

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

  return (
    <main>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <JobDetailView job={data?.job} webhookLogs={data?.webhookLogs} />
      </div>
    </main>
  )
}
