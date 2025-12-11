import type { Request, Response, NextFunction } from "express"
import { Op } from "sequelize"
import Job from "../models/Job"
import WebhookLog from "../models/WebhookLog"
import { triggerWebhook } from "../services/webhookService"
import { validateJobCreation } from "../validators/jobValidator"
import sequelize from "../database/connection"

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validateJobCreation(req.body)
    if (error) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: error.details[0].message })
    }

    const job = await Job.create({
      taskName: value.taskName,
      payload: value.payload,
      priority: value.priority || "Low",
      status: "pending",
      attempts: 0,
    })

    console.log(`[Job] Created: ID=${job.id}, Task=${job.taskName}, Priority=${job.priority}`)
    ;(req as any).io.emit("job:created", job.toJSON())

    res.status(201).json(job)
  } catch (err) {
    next(err)
  }
}

export const listJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, search = "", limit = 20, offset = 0, sort = "createdAt:desc" } = req.query

    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (search) where.taskName = { [Op.like]: `%${search}%` }

    const [sortField, sortOrder] = (sort as string).split(":")
    const order: [string, string][] = [[sortField || "createdAt", (sortOrder || "DESC").toUpperCase() as any]]

    const { count, rows } = await Job.findAndCountAll({
      where,
      limit: Number.parseInt(limit as string),
      offset: Number.parseInt(offset as string),
      order,
    })

    res.json({
      jobs: rows,
      total: count,
      limit: Number.parseInt(limit as string),
      offset: Number.parseInt(offset as string),
    })
  } catch (err) {
    next(err)
  }
}

export const getJobDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const job = await Job.findByPk(id)

    if (!job) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Job not found" })
    }

    const webhookLogs = await WebhookLog.findAll({
      where: { jobId: id },
      order: [["createdAt", "DESC"]],
      limit: 20,
    })

    res.json({ job, webhookLogs })
  } catch (err) {
    next(err)
  }
}

export const runJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const transaction = await sequelize.transaction()
    try {
      const job = await Job.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction })

      if (!job) {
        await transaction.rollback()
        return res.status(404).json({ code: "NOT_FOUND", message: "Job not found" })
      }

      if (job.status === "running") {
        await transaction.rollback()
        return res.status(409).json({ code: "CONFLICT", message: "Job is already running" })
      }

      if (job.status === "completed") {
        await transaction.rollback()
        return res.status(409).json({ code: "CONFLICT", message: "Job already completed" })
      }

      const startTime = Date.now()
      await job.update(
        {
          status: "running",
          startedAt: new Date(),
          attempts: job.attempts + 1,
        },
        { transaction },
      )

      await transaction.commit()

      console.log(`[Job] Started running: ID=${job.id}, Attempt=${job.attempts}`)
      ;(req as any).io.emit("job:started", job.toJSON())

      setTimeout(async () => {
        try {
          const shouldFail = process.env.SIMULATE_JOB_FAILURE === "true"
          if (shouldFail && Math.random() < 0.3) {
            throw new Error("Simulated job failure")
          }

          const duration = Date.now() - startTime
          await job.update({
            status: "completed",
            completedAt: new Date(),
            runDurationMs: duration,
          })

          console.log(`[Job] Completed: ID=${job.id}, Duration=${duration}ms`)
          ;(req as any).io.emit("job:completed", job.toJSON())

          await triggerWebhook(job, (req as any).io)
        } catch (error: any) {
          await job.update({
            status: "failed",
            lastError: error.message,
          })

          console.error(`[Job] Failed: ID=${job.id}, Error=${error.message}`)
          ;(req as any).io.emit("job:failed", job.toJSON())
        }
      }, 3000)

      res.json(job)
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  } catch (err) {
    next(err)
  }
}
