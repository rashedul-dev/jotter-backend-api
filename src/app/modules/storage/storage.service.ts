import User from "../auth/auth.model"
import File from "../files/file.model"
import Folder from "../folders/folder.model"
import { Types } from "mongoose"
import { AppError } from "../../middlewares/error.middleware"

export const calculateStorageBreakdown = async (userId: string) => {
  const userObjectId = new Types.ObjectId(userId)

  const breakdown = {
    folders: { count: 0, size: 0 },
    notes: { count: 0, size: 0 },
    images: { count: 0, size: 0 },
    pdfs: { count: 0, size: 0 },
  }

  // Get folder count
  breakdown.folders.count = await Folder.countDocuments({ owner: userObjectId })

  // Get file stats by type
  const fileStats = await File.aggregate([
    { $match: { owner: userObjectId } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalSize: { $sum: "$fileSize" },
      },
    },
  ])

  fileStats.forEach((stat) => {
    if (stat._id === "note") {
      breakdown.notes.count = stat.count
      breakdown.notes.size = stat.totalSize
    } else if (stat._id === "image") {
      breakdown.images.count = stat.count
      breakdown.images.size = stat.totalSize
    } else if (stat._id === "pdf") {
      breakdown.pdfs.count = stat.count
      breakdown.pdfs.size = stat.totalSize
    }
  })

  // Folder size is sum of folder storageUsed
  const folderStats = await Folder.aggregate([
    { $match: { owner: userObjectId } },
    { $group: { _id: null, totalSize: { $sum: "$storageUsed" } } },
  ])
  breakdown.folders.size = folderStats[0]?.totalSize || 0

  return breakdown
}

export const checkStorageLimit = async (userId: string, additionalSize: number) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError("User not found", 404)
  }

  return user.usedStorage + additionalSize <= user.storageLimit
}

export const updateStorageUsage = async (userId: string, sizeChange: number) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { usedStorage: sizeChange },
    },
    { new: true },
  )

  if (!user) {
    throw new AppError("User not found", 404)
  }

  return user
}

export const getStorageSummary = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError("User not found", 404)
  }

  return {
    total: user.storageLimit,
    used: user.usedStorage,
    available: user.storageLimit - user.usedStorage,
    percentageUsed: (user.usedStorage / user.storageLimit) * 100,
  }
}
