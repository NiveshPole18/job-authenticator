import axios from "axios"
import WebhookLog from "../models/WebhookLog"
import type Job from "../models/Job"
import crypto from "crypto"

const WEBHOOK_URL = process.env.OUTBOUND_WEBHOOK
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "webhook-secret"
const MAX_RETRIES = 3

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getBackoffDelay = (attempt: number): number => {
  const baseDelay = 1000
  const jitter = Math.random() * 1000
  return baseDelay * Math.pow(2, attempt) + jitter
}

const signWebhook = (payload: object): string => {
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET)
  hmac.update(JSON.stringify(payload))
  return hmac.digest("hex")
}

export const triggerWebhook = async (job: Job, io: any): Promise<void> => {
  const targetUrl = (job.payload as any)?.webhookUrl || WEBHOOK_URL

  if (!targetUrl) {
    console.log("[Webhook] OUTBOUND_WEBHOOK not configured, skipping")
    return
  }

  const payload = {
    jobId: job.id,
    taskName: job.taskName,
    priority: job.priority,
    status: job.status,
    payload: job.payload,
    completedAt: job.completedAt,
    runDurationMs: job.runDurationMs,
  }

  let attempt = 0
  let lastError: string | null = null

  while (attempt < MAX_RETRIES) {
    try {
      const signature = signWebhook(payload)
      const response = await axios.post(targetUrl, payload, {
        headers: {
          "X-Signature": signature,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })

      await WebhookLog.create({
        jobId: job.id,
        url: targetUrl,
        requestBody: payload,
        responseStatus: response.status,
        responseBody: JSON.stringify(response.data),
        attempt: attempt + 1,
        error: null,
      })

      console.log(`[Webhook] Success: Job=${job.id}, Status=${response.status}`)
      io.emit("webhook:sent", { jobId: job.id, status: response.status })
      return
    } catch (error: any) {
      lastError = error.message
      attempt++

      await WebhookLog.create({
        jobId: job.id,
        url: targetUrl,
        requestBody: payload,
        responseStatus: error.response?.status || null,
        responseBody: error.response?.data ? JSON.stringify(error.response.data) : null,
        attempt,
        error: error.message,
      })

      if (attempt < MAX_RETRIES) {
        const delay = getBackoffDelay(attempt - 1)
        console.log(`[Webhook] Retry ${attempt}/${MAX_RETRIES}: Job=${job.id}, Delay=${Math.round(delay)}ms`)
        await sleep(delay)
      } else {
        console.error(`[Webhook] Failed after ${MAX_RETRIES} attempts: Job=${job.id}, Error=${error.message}`)
      }
    }
  }

  io.emit("webhook:failed", { jobId: job.id, error: lastError })
}
