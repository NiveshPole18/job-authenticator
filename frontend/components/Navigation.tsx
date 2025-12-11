"use client"

import Link from "next/link"

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-lavender-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-lavender-700 hover:text-lavender-800">
          📋 Job Scheduler
        </Link>
        <div className="flex gap-4">
          <Link href="/" className="px-4 py-2 text-lavender-700 hover:bg-lavender-50 rounded-lg transition">
            Dashboard
          </Link>
          <Link
            href="/jobs/new"
            className="px-4 py-2 bg-lavender-600 text-white rounded-lg hover:bg-lavender-700 transition"
          >
            + New Job
          </Link>
        </div>
      </div>
    </nav>
  )
}
