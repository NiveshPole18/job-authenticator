import sequelize from "./connection"
import Job from "../models/Job"

const seed = async () => {
  try {
    await sequelize.authenticate()
    console.log("✓ Database connected")

    const existingJobs = await Job.count()
    if (existingJobs > 0) {
      console.log("✓ Database already seeded, skipping")
      process.exit(0)
    }

    const sampleJobs = [
      {
        taskName: "Send Welcome Email",
        payload: { recipientEmail: "user@example.com", subject: "Welcome!" },
        priority: "High",
        status: "completed",
        attempts: 1,
        completedAt: new Date(),
        runDurationMs: 2341,
      },
      {
        taskName: "Generate Monthly Report",
        payload: { month: "December", year: 2024, format: "PDF" },
        priority: "Medium",
        status: "pending",
        attempts: 0,
      },
      {
        taskName: "Sync Data from API",
        payload: { sourceApi: "https://api.example.com/data", batchSize: 100 },
        priority: "Low",
        status: "pending",
        attempts: 0,
      },
      {
        taskName: "Clean Old Files",
        payload: { directory: "/tmp/uploads", olderThanDays: 30 },
        priority: "Low",
        status: "failed",
        attempts: 2,
        lastError: "Permission denied",
      },
      {
        taskName: "Send Notification",
        payload: { userId: 123, type: "alert" },
        priority: "High",
        status: "running",
        attempts: 1,
        startedAt: new Date(),
      },
    ]

    await Job.bulkCreate(sampleJobs)
    console.log(`✓ Seeded ${sampleJobs.length} sample jobs`)

    process.exit(0)
  } catch (error) {
    console.error("✗ Seed failed:", error)
    process.exit(1)
  }
}

seed()
