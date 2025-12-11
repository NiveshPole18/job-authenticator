import request from "supertest"
import app from "../index"
import sequelize from "../database/connection"
import Job from "../models/Job"

describe("Job API", () => {
  beforeAll(async () => {
    await sequelize.authenticate()
    await Job.sync({ alter: true })
  })

  afterEach(async () => {
    await Job.destroy({ where: {} })
  })

  afterAll(async () => {
    await sequelize.close()
  })

  describe("POST /api/jobs", () => {
    it("should create a new job", async () => {
      const response = await request(app)
        .post("/api/jobs")
        .send({
          taskName: "Test Job",
          payload: { test: true },
          priority: "High",
        })

      expect(response.status).toBe(201)
      expect(response.body.taskName).toBe("Test Job")
      expect(response.body.status).toBe("pending")
    })

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/jobs")
        .send({
          payload: { test: true },
        })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })
  })

  describe("GET /api/jobs", () => {
    it("should list jobs", async () => {
      await Job.create({
        taskName: "Job 1",
        priority: "Low",
        status: "pending",
      })

      const response = await request(app).get("/api/jobs").query({ limit: 10, offset: 0 })

      expect(response.status).toBe(200)
      expect(response.body.jobs).toHaveLength(1)
      expect(response.body.total).toBe(1)
    })

    it("should filter by status", async () => {
      await Job.create({
        taskName: "Job 1",
        priority: "Low",
        status: "pending",
      })

      await Job.create({
        taskName: "Job 2",
        priority: "Low",
        status: "completed",
      })

      const response = await request(app).get("/api/jobs").query({ status: "pending" })

      expect(response.status).toBe(200)
      expect(response.body.jobs).toHaveLength(1)
      expect(response.body.jobs[0].status).toBe("pending")
    })
  })

  describe("GET /api/jobs/:id", () => {
    it("should get job detail", async () => {
      const job = await Job.create({
        taskName: "Test Job",
        priority: "Medium",
        status: "pending",
      })

      const response = await request(app).get(`/api/jobs/${job.id}`)

      expect(response.status).toBe(200)
      expect(response.body.job.id).toBe(job.id)
      expect(response.body.webhookLogs).toBeInstanceOf(Array)
    })

    it("should return 404 for non-existent job", async () => {
      const response = await request(app).get("/api/jobs/99999")

      expect(response.status).toBe(404)
    })
  })
})
