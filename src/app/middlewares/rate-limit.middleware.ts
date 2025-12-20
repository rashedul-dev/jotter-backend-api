import type { Request, Response, NextFunction } from "express"
import { AppError } from "./error.middleware"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Simple in-memory rate limiter
export const rateLimit = (options: { windowMs: number; max: number; message?: string }) => {
  const { windowMs, max, message = "Too many requests, please try again later" } = options

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.path}`
    const now = Date.now()

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      }
      return next()
    }

    store[key].count++

    if (store[key].count > max) {
      return next(new AppError(message, 429))
    }

    next()
  }
}

// Cleanup old entries every 10 minutes
setInterval(
  () => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  },
  10 * 60 * 1000,
)
