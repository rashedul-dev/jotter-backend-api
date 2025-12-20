import type { Request, Response, NextFunction } from "express"

// Custom error class
export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error occurred:", err)

  let error = { ...err }
  error.message = err.message

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    error = new AppError(message, 409)
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message)
    const message = messages.join(", ")
    error = new AppError(message, 400)
  }

  // Mongoose cast error (invalid ID)
  if (err.name === "CastError") {
    const message = "Invalid ID format"
    error = new AppError(message, 400)
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401)
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired", 401)
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new AppError("File size exceeds limit", 413)
  }

  // Multer file type error
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error = new AppError("Invalid file type", 415)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
}
