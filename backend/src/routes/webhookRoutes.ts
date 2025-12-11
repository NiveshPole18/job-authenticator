import express, { type Request, type Response } from "express"
import crypto from "crypto"

const router = express.Router()

router.post("/", (req: Request, res: Response) => {
  const signature = req.headers["x-signature"] as string
  const payload = req.body

  if (process.env.WEBHOOK_SECRET) {
    const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET)
    hmac.update(JSON.stringify(payload))
    const expectedSignature = hmac.digest("hex")

    if (signature !== expectedSignature) {
      return res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid signature" })
    }
  }

  console.log("[Webhook Test Receiver] Received:", payload)
  res.json({ received: true, timestamp: new Date() })
})

export default router
