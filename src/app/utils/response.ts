import type { Response } from "express"

interface SuccessResponse {
  success: true
  message?: string
  data?: any
  meta?: any
}

interface ErrorResponse {
  success: false
  message: string
  errors?: any
}

export const sendSuccess = (res: Response, data: any, message?: string, statusCode = 200, meta?: any) => {
  const response: SuccessResponse = {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
    ...(meta && { meta }),
  }

  return res.status(statusCode).json(response)
}

export const sendError = (res: Response, message: string, statusCode = 500, errors?: any) => {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  }

  return res.status(statusCode).json(response)
}

// Pagination helper
export const getPaginationMeta = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
