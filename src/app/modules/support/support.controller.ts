import type { Response } from "express"
import * as SupportService from "./support.service"
import type { AuthRequest } from "../auth/auth.middleware"
import { asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"
import { AppError } from "../../middlewares/error.middleware"

export const createSupportRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { type, subject, description, priority } = req.body

  if (!type || !subject || !description) {
    throw new AppError("Type, subject, and description are required", 400)
  }

  const attachments = req.files
    ? (req.files as any[]).map((f) => ({
        filename: f.filename,
        path: f.path,
        size: f.size,
      }))
    : []

  const request = await SupportService.createSupportRequest({
    user: user._id,
    type,
    subject,
    description,
    priority: priority || "medium",
    attachments,
  })

  sendSuccess(res, { request }, "Support request submitted successfully", 201)
})

export const getFAQs = asyncHandler(async (req: any, res: Response) => {
  const category = req.query.category as string
  const faqs = await SupportService.getFAQs(category)
  sendSuccess(res, { faqs, total: faqs.length })
})

export const getSupportRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const requests = await SupportService.getUserSupportRequests(user._id as string)
  sendSuccess(res, { requests, total: requests.length })
})

export const getSupportRequestDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const request = await SupportService.getSupportRequestById(req.params.id, user._id as string)
  sendSuccess(res, { request })
})

export const getContactInfo = asyncHandler(async (req: any, res: Response) => {
  sendSuccess(res, {
    contact: {
      email: "support@jotter.com",
      phone: "(609) 327-7992",
      supportHours: "Monday-Friday, 9:00 AM - 5:00 PM EST",
      responseTime: "Typically within 24 hours",
      address: "123 Jotter Street, Suite 100, New York, NY 10001",
    },
  })
})
