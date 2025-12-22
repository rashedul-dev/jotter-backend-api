import Activity from "../activity/activity.model"
import { Types } from "mongoose"

export const getCalendarActivities = async (userId: string, year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

  return await Activity.aggregate([
    {
      $match: {
        user: new Types.ObjectId(userId),
        timestamp: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        count: { $sum: 1 },
        items: {
          $push: {
            id: "$_id",
            action: "$action",
            resourceType: "$resourceType",
            resourceTitle: "$resourceTitle",
            timestamp: "$timestamp",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ])
}

export const getDayActivities = async (userId: string, date: string) => {
  // Parse the date string properly to avoid timezone offset issues
  const [year, month, day] = date.split("-").map(Number)

  // Create start and end dates in UTC
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))

  return await Activity.find({
    user: new Types.ObjectId(userId),
    timestamp: { $gte: start, $lte: end },
  }).sort({ timestamp: -1 })
}