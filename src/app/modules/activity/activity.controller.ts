import type { Response } from "express"
import Activity from "./activity.model"
import type { AuthRequest } from "../auth/auth.middleware"
import { asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"

export const getActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { date, limit = "50", action, resourceType } = req.query

  const query: any = { user: user._id }

  if (date) {
    const start = new Date(date as string)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date as string)
    end.setHours(23, 59, 59, 999)
    query.timestamp = { $gte: start, $lte: end }
  }

  if (action) {
    query.action = action
  }

  if (resourceType) {
    query.resourceType = resourceType
  }

  const activities = await Activity.find(query)
    .sort({ timestamp: -1 })
    .limit(Number.parseInt(limit as string))

  sendSuccess(res, { activities })
})

export const getRecentActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const limit = Number.parseInt((req.query.limit as string) || "10")

  const activities = await Activity.find({ user: user._id }).sort({ timestamp: -1 }).limit(limit)

  sendSuccess(res, { activities })
})

export const clearOldActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { daysOld = "30" } = req.body

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - Number.parseInt(daysOld))

  const result = await Activity.deleteMany({
    user: user._id,
    timestamp: { $lt: cutoffDate },
  })

  sendSuccess(res, { deletedCount: result.deletedCount }, `Deleted ${result.deletedCount} old activities`)
})
