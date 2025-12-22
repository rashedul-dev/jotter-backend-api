import Activity from "./activity.model"
import { Types } from "mongoose"

export const logActivity = async (
  userId: string,
  action: "created" | "updated" | "deleted" | "viewed" | "favorited" | "moved",
  resourceType: "folder" | "note" | "image" | "pdf",
  resourceId: string,
  resourceTitle: string,
) => {
  try {
    await Activity.create({
      user: new Types.ObjectId(userId),
      action,
      resourceType,
      resourceId: new Types.ObjectId(resourceId),
      resourceTitle,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Error logging activity:", error)
  }
}

export const getActivityStats = async (userId: string, days = 30) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const stats = await Activity.aggregate([
    {
      $match: {
        user: new Types.ObjectId(userId),
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
      },
    },
  ])

  return stats.reduce(
    (acc, item) => {
      acc[item._id] = item.count
      return acc
    },
    {} as Record<string, number>,
  )
}
