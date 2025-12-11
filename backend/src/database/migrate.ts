import sequelize from "./connection"
import Job from "../models/Job"
import WebhookLog from "../models/WebhookLog"

const migrate = async () => {
  try {
    await sequelize.authenticate()
    console.log("✓ Database connected")

    await Job.sync({ alter: true })
    console.log("✓ Jobs table synced")

    await WebhookLog.sync({ alter: true })
    console.log("✓ Webhook logs table synced")

    console.log("✓ Migration complete")
    process.exit(0)
  } catch (error) {
    console.error("✗ Migration failed:", error)
    process.exit(1)
  }
}

migrate()
