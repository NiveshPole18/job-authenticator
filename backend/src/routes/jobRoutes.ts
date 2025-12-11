import express from "express"
import { createJob, listJobs, getJobDetail, runJob } from "../controllers/jobController"
import { rateLimiter } from "../middleware/rateLimiter"

const router = express.Router()

router.post("/", createJob)
router.get("/", listJobs)
router.get("/:id", getJobDetail)
router.post("/:id/run", rateLimiter, runJob)

export default router
