"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
// Avoid path aliases for compatibility and linting issues
import JobForm from "../../../components/JobForm"
import Navigation from "../../../components/Navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function CreateJobPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    setError(null)
    try {
      let payload = formData.payload
      if (typeof payload === "string" && payload.trim() !== "") {
        try {
          payload = JSON.parse(payload)
        } catch (e) {
          setError("Payload must be valid JSON")
          setIsSubmitting(false)
          return
        }
      }
      await axios.post(`${API_URL}/jobs`, {
        taskName: formData.taskName,
        payload,
        priority: formData.priority,
      })
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create job")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-lavender-900">Create New Job</h1>
          <p className="text-lavender-600 mt-2">Set up a new automated task</p>
        </div>
        <div className="animate-slide-up">
          <JobForm onSubmit={handleSubmit} isLoading={isSubmitting} error={error} />
        </div>
      </div>
    </main>
  )
}
