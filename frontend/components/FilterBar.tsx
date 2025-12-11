"use client"

import { useState } from "react"

interface Props {
  onFilterChange: (filters: any) => void
}

export default function FilterBar({ onFilterChange }: Props) {
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("createdAt:desc")

  const handleStatusChange = (e: any) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    onFilterChange({ status: newStatus, priority, search, sort })
  }

  const handlePriorityChange = (e: any) => {
    const newPriority = e.target.value
    setPriority(newPriority)
    onFilterChange({ status, priority: newPriority, search, sort })
  }

  const handleSearchChange = (e: any) => {
    const value = e.target.value
    setSearch(value)
    onFilterChange({ status, priority, search: value, sort })
  }

  const handleSortChange = (e: any) => {
    const value = e.target.value
    setSort(value)
    onFilterChange({ status, priority, search, sort: value })
  }

  const handleReset = () => {
    setStatus("")
    setPriority("")
    setSearch("")
    setSort("createdAt:desc")
    onFilterChange({ status: "", priority: "", search: "", sort: "createdAt:desc" })
  }

  return (
    <div className="bg-white rounded-lg border border-lavender-200 p-4 mb-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-lavender-700 mb-1">Status</label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-lavender-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={handlePriorityChange}
            className="w-full px-3 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-lavender-700 mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by task name"
            className="w-full px-3 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
          />
        </div>

        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-lavender-700 mb-1">Sort</label>
          <select
            value={sort}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="priority:desc">Priority (High→Low)</option>
            <option value="priority:asc">Priority (Low→High)</option>
          </select>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-lavender-100 text-lavender-700 rounded-lg hover:bg-lavender-200 transition self-end"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
