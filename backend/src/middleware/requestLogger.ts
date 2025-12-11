import type { Request, Response, NextFunction } from "express"

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  const originalSend = res.send

  res.send = function (data) {
    const duration = Date.now() - start
    console.log(`[HTTP] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`)
    return originalSend.call(this, data)
  }

  next()
}
