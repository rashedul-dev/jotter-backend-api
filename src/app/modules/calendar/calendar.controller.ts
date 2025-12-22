import type { Response } from "express"
import * as CalendarService from "./calendar.service"
import type { AuthRequest } from "../auth/auth.middleware"
import { AppError, asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"

export const getCalendarData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const year = Number.parseInt((req.query.year as string) || new Date().getFullYear().toString())
  const month = Number.parseInt((req.query.month as string) || (new Date().getMonth() + 1).toString())
  const day = req.query.day ? Number.parseInt(req.query.day as string) : undefined

  if (day !== undefined) {
    const date = new Date(Date.UTC(year, month - 1, day))
    const dateString = date.toISOString().split("T")[0]
    const activities = await CalendarService.getDayActivities(user._id as string, dateString)

    return sendSuccess(res, {
      year,
      month,
      day,
      date: dateString,
      activities,
      summary: {
        totalActivities: activities.length,
      },
    })
  }

  const activities = await CalendarService.getCalendarActivities(user._id as string, year, month)

  sendSuccess(res, {
    year,
    month,
    days: activities,
    summary: {
      totalDays: activities.length,
      totalActivities: activities.reduce((sum, day) => sum + day.count, 0),
    },
  })
})

export const getDayActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { date } = req.params

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError("Invalid date format. Use YYYY-MM-DD", 400)
  }

  const activities = await CalendarService.getDayActivities(user._id as string, date)

  sendSuccess(res, { date, activities })
})