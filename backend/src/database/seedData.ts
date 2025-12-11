import sequelize from "./connection"
import Job from "../models/Job"

const seedLoadTest = async () => {
  try {
    await sequelize.authenticate()
    console.log("✓ Database connected")

    const bulkSize = 10000
    const jobs = Array.from({ length: bulkSize }).map((_, idx) => ({
      taskName: `Synthetic Job ${idx + 1}`,
      payload: { synthetic: true, index: idx + 1 },
      priority: idx % 3 === 0 ? "High" : idx % 3 === 1 ? "Medium" : "Low",
      status: "pending" as const,
      attempts: 0,
    }))

    await Job.bulkCreate(jobs)
    console.log(`✓ Inserted ${bulkSize} synthetic jobs for load testing`)
    process.exit(0)
  } catch (error) {
    console.error("✗ Seed load test failed:", error)
    process.exit(1)
  }
}

seedLoadTest()

