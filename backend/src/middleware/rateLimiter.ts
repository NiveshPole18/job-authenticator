import rateLimit from "express-rate-limit"

export const rateLimiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW || "900000"),
  max: Number.parseInt(process.env.RATE_LIMIT_MAX || "100"),
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
})
