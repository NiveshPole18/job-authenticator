import "dotenv/config"
import Job from "../backend/src/models/Job"
import sequelize from "../backend/src/database/connection"
import { runJob } from "../backend/src/controllers/jobController"
import express from "express"

/**
 * Lightweight worker that periodically picks the oldest pending job and triggers the existing runJob controller.
 * Intended for optional background execution. Configure interval via WORKER_INTERVAL_MS (default 5000).
 */
const app = express()
app.use(express.json())

const intervalMs = Number.parseInt(process.env.WORKER_INTERVAL_MS || "5000")

const tick = async () => {
  try {
    const job = await Job.findOne({ where: { status: "pending" }, order: [["createdAt", "ASC"]] })
    if (!job) {
      return
    }

    // Reuse controller logic for status transitions and webhook handling
    await runJob(
      { params: { id: String(job.id) }, body: {}, io: { emit: () => {} } } as any,
      { json: () => {}, status: () => ({ json: () => {} }) } as any,
      (err?: any) => {
        if (err) {
          console.error("[Worker] Error running job:", err)
        }
      },
    )
  } catch (error) {
    console.error("[Worker] Tick error:", error)
  }
}

const start = async () => {
  await sequelize.authenticate()
  console.log(`[Worker] Connected to DB. Polling every ${intervalMs}ms`)
  setInterval(tick, intervalMs)
}

start().catch((err) => {
  console.error("[Worker] Failed to start:", err)
  process.exit(1)
})

