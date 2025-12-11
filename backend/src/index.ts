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
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() })
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
const PORT = process.env.PORT || 5000

sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("✓ Database synchronized")
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
    })
  })
  .catch((err) => {
    console.error("✗ Database sync failed:", err)
    process.exit(1)
  })

export default app
export { io }
