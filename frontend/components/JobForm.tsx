"use client"

import { useState } from "react"

interface Props {
  onSubmit: (data: any) => void
  isLoading: boolean
  error: string | null
}

export default function JobForm({ onSubmit, isLoading, error }: Props) {
  const [formData, setFormData] = useState({
    taskName: "",
    payload: "{}",
    priority: "Low",
  })
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayloadChange = (e: any) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, payload: value }))

    try {
      JSON.parse(value)
      setJsonError(null)
    } catch (err) {
      setJsonError("Invalid JSON")
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()

    if (!formData.taskName.trim()) {
      setJsonError("Task name is required")
      return
    }

    try {
      JSON.parse(formData.payload)
    } catch (err) {
      setJsonError("Invalid JSON in payload")
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-lavender-200 p-8 animate-fade-in">
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">{error}</div>}

      <div className="mb-6">
        <label className="block text-sm font-medium text-lavender-900 mb-2">Task Name *</label>
        <input
          type="text"
          name="taskName"
          value={formData.taskName}
          onChange={handleInputChange}
          placeholder="e.g., Send Email Notification"
          className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-lavender-900 mb-2">JSON Payload</label>
        <textarea
          name="payload"
          value={formData.payload}
          onChange={handlePayloadChange}
          placeholder='{"key": "value"}'
          className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500 font-mono text-sm h-32"
        />
        {jsonError && <p className="text-red-600 text-sm mt-1">{jsonError}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-lavender-900 mb-3">Priority</label>
        <div className="flex gap-4">
          {["Low", "Medium", "High"].map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priority"
                value={p}
                checked={formData.priority === p}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-lavender-900">{p}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !!jsonError}
        className="w-full px-6 py-3 bg-lavender-600 text-white rounded-lg hover:bg-lavender-700 disabled:opacity-50 transition font-medium"
      >
        {isLoading ? "Creating Job..." : "Create Job"}
      </button>
    </form>
  )
}
