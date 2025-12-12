import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import sequelize from "./database/connection"
import jobRoutes from "./routes/jobRoutes"
import webhookRoutes from "./routes/webhookRoutes"
import { errorHandler } from "./middleware/errorHandler"
import { requestLogger } from "./middleware/requestLogger"
import { rateLimiter } from "./middleware/rateLimiter"
import { runJob } from "./controllers/jobController"

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" },
})

// Middleware
app.use(morgan("combined"))
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))
app.use(express.json({ limit: "10mb" }))
app.use(requestLogger)

// Make io accessible to routes
app.use((req, res, next) => {
  ;(req as any).io = io
  next()
})

// Routes
app.use("/api/jobs", jobRoutes)
app.use("/api/webhook-test", webhookRoutes)
app.post("/api/run-job/:id", rateLimiter, runJob)

// Health check
app.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "unknown",
  }
  
  // Check database connection
  try {
    await sequelize.authenticate()
    health.database = "connected"
  } catch (err: any) {
    health.database = `disconnected: ${err.message}`
  }
  
  res.json(health)
})

// Error handler
app.use(errorHandler)

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("[Socket.IO] Client connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("[Socket.IO] Client disconnected:", socket.id)
  })
})

// Database sync and server start
const PORT = Number(process.env.PORT) || 5000

// Start server immediately (Render needs port binding ASAP)
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Server running on port ${PORT}`)
  console.log(`✓ Listening on 0.0.0.0:${PORT}`)
  console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  console.log(`✓ Database URL configured: ${process.env.DATABASE_URL ? "Yes (DATABASE_URL)" : process.env.DB_HOST ? `Yes (${process.env.DB_HOST}:${process.env.DB_PORT})` : "No - check environment variables"}`)
  
  // Connect to database asynchronously (non-blocking)
  // Server will start even if database fails
  setTimeout(() => {
    sequelize
      .authenticate()
      .then(() => {
        console.log("✓ Database connection established")
        return sequelize.sync({ alter: false })
      })
      .then(() => {
        console.log("✓ Database synchronized")
      })
      .catch((err) => {
        console.error("✗ Database connection/sync failed:", err.message)
        console.error("Error code:", err.code || err.parent?.code)
        console.error("Database config:", {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          host: process.env.DB_HOST || "not set",
          port: process.env.DB_PORT || "not set",
          database: process.env.DB_NAME || "not set",
        })
        console.error("Note: Server is running, but database operations will fail until connection is fixed.")
        console.error("Fix: Set DATABASE_URL or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD in Render environment variables")
        // Don't exit - server continues running
      })
  }, 1000) // Small delay to ensure server is fully started
})

export default app
export { io }
