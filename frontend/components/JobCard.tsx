"use client"

import Link from "next/link"

interface Props {
  job: any
  isRunning: boolean
  onRun: () => void
  statusColor: string
  priorityColor: string
}

export default function JobCard({ job, isRunning, onRun, statusColor, priorityColor }: Props) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="bg-white rounded-lg border border-lavender-200 p-6 hover:shadow-lg transition-all cursor-pointer hover:border-lavender-400 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lavender-900 text-lg line-clamp-2">{job.taskName}</h3>
          <span className={`text-xs px-2 py-1 rounded-full border ${statusColor}`}>{job.status}</span>
        </div>

        <p className={`text-sm font-medium mb-4 ${priorityColor}`}>{job.priority} Priority</p>

        <div className="text-xs text-lavender-500 space-y-1 mb-4 flex-grow">
          <p>Created: {new Date(job.createdAt).toLocaleDateString()}</p>
          <p>Attempts: {job.attempts}</p>
          {job.runDurationMs && <p>Duration: {job.runDurationMs}ms</p>}
        </div>

        <div onClick={(e) => e.preventDefault()}>
          <button
            onClick={onRun}
            disabled={job.status === "running" || job.status === "completed" || isRunning}
            className="w-full px-3 py-2 bg-lavender-600 text-white text-sm rounded-lg hover:bg-lavender-700 disabled:opacity-50 transition"
          >
            {isRunning ? "Running..." : "Run Job"}
          </button>
        </div>
      </div>
    </Link>
  )
}
