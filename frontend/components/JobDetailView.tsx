"use client"

import Link from "next/link"
import JSONViewer from "./JSONViewer"

interface Props {
  job: any
  webhookLogs: any[]
}

export default function JobDetailView({ job, webhookLogs }: Props) {
  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-lavender-600">Job not found</p>
        <Link href="/" className="text-lavender-600 hover:underline mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: "bg-yellow-100 text-yellow-800",
      running: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }
    return badges[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/" className="text-lavender-600 hover:underline">
        ← Back to Dashboard
      </Link>

      <div className="bg-white rounded-lg border border-lavender-200 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-lavender-900">{job.taskName}</h1>
            <p className="text-lavender-600 mt-1">ID: {job.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-lg font-medium ${getStatusBadge(job.status)}`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-lavender-50 p-4 rounded-lg">
            <p className="text-xs text-lavender-600 font-semibold uppercase">Priority</p>
            <p className="text-lg font-bold text-lavender-900">{job.priority}</p>
          </div>
          <div className="bg-lavender-50 p-4 rounded-lg">
            <p className="text-xs text-lavender-600 font-semibold uppercase">Attempts</p>
            <p className="text-lg font-bold text-lavender-900">{job.attempts}</p>
          </div>
          <div className="bg-lavender-50 p-4 rounded-lg">
            <p className="text-xs text-lavender-600 font-semibold uppercase">Duration</p>
            <p className="text-lg font-bold text-lavender-900">
              {job.runDurationMs ? `${job.runDurationMs}ms` : "N/A"}
            </p>
          </div>
          <div className="bg-lavender-50 p-4 rounded-lg">
            <p className="text-xs text-lavender-600 font-semibold uppercase">Created</p>
            <p className="text-lg font-bold text-lavender-900">{new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {job.payload && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-lavender-900 mb-4">Payload</h2>
            <div className="bg-lavender-50 rounded-lg p-4 border border-lavender-200">
              <JSONViewer data={job.payload} />
            </div>
          </div>
        )}

        {job.lastError && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-lavender-900 mb-4">Error</h2>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-red-800">{job.lastError}</div>
          </div>
        )}
      </div>

      {webhookLogs && webhookLogs.length > 0 && (
        <div className="bg-white rounded-lg border border-lavender-200 p-8">
          <h2 className="text-2xl font-bold text-lavender-900 mb-6">Webhook Logs ({webhookLogs.length})</h2>
          <div className="space-y-4">
            {webhookLogs.map((log, idx) => (
              <div key={idx} className="border border-lavender-200 rounded-lg p-4 bg-lavender-50">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-lavender-900">Attempt {log.attempt}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      log.responseStatus === 200
                        ? "bg-green-100 text-green-800"
                        : log.error
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {log.responseStatus ? `${log.responseStatus}` : "Failed"}
                  </span>
                </div>
                <p className="text-sm text-lavender-600 mb-2">{new Date(log.createdAt).toLocaleString()}</p>
                {log.error && <p className="text-sm text-red-700 mb-2">Error: {log.error}</p>}
                {log.url && <p className="text-xs text-lavender-500 truncate">URL: {log.url}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
