import User from "../auth/auth.model"
import File from "../files/file.model"
import Folder from "../folders/folder.model"
import type { ISettings } from "../../interfaces/models"
import { AppError } from "../../middlewares/error.middleware"
import fs from "fs"
import path from "path"

export const getProfileById = async (userId: string) => {
  const user = await User.findById(userId).select("-password -pinCode")
  if (!user) {
    throw new AppError("User not found", 404)
  }
  return user
}

export const updateProfileInfo = async (userId: string, updates: { username?: string; profileImage?: string }) => {
  if (updates.username) {
    const existing = await User.findOne({ username: updates.username, _id: { $ne: userId } })
    if (existing) {
      throw new AppError("Username already taken", 409)
    }
  }

  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select(
    "-password -pinCode",
  )

  if (!user) {
    throw new AppError("User not found", 404)
  }

  return user
}

export const deleteProfileImage = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError("User not found", 404)
  }

  if (user.profileImage) {
    const filePath = path.join(process.cwd(), user.profileImage)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    user.profileImage = undefined
    await user.save()
  }
}

export const getUserStatistics = async (userId: string, createdAt: Date) => {
  const [totalFiles, totalFolders, favoriteFiles, recentFiles, filesByType, totalStorage] = await Promise.all([
    File.countDocuments({ owner: userId }),
    Folder.countDocuments({ owner: userId }),
    File.countDocuments({ owner: userId, isFavorite: true }),
    File.countDocuments({
      owner: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    File.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: "$type", count: { $sum: 1 }, size: { $sum: "$fileSize" } } },
    ]),
    File.aggregate([{ $match: { owner: userId } }, { $group: { _id: null, total: { $sum: "$fileSize" } } }]),
  ])

  const accountAge = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))

  const fileTypeBreakdown = filesByType.reduce(
    (acc, item) => {
      acc[item._id] = { count: item.count, size: item.size }
      return acc
    },
    {} as Record<string, { count: number; size: number }>,
  )

  const storageUsed = totalStorage.length > 0 ? totalStorage[0].total : 0
  const storageLimit = 15 * 1024 * 1024 * 1024 // 15GB in bytes
  const availableStorage = storageLimit - storageUsed
  const storagePercentage = ((storageUsed / storageLimit) * 100).toFixed(2)

  return {
    totalFiles,
    totalFolders,
    favoriteFiles,
    recentFiles,
    accountAge,
    storage: {
      total: storageLimit,
      used: storageUsed,
      available: availableStorage,
      percentage: Number.parseFloat(storagePercentage),
    },
    fileTypeBreakdown,
    imageCount: fileTypeBreakdown.image?.count || 0,
    pdfCount: fileTypeBreakdown.pdf?.count || 0,
    noteCount: fileTypeBreakdown.note?.count || 0,
    imageStorage: fileTypeBreakdown.image?.size || 0,
    pdfStorage: fileTypeBreakdown.pdf?.size || 0,
    noteStorage: fileTypeBreakdown.note?.size || 0,
  }
}

export const getSettings = async (userId: string) => {
  const user = await User.findById(userId).select("settings")
  if (!user) {
    throw new AppError("User not found", 404)
  }
  return user.settings
}

export const updateSettings = async (userId: string, settings: Partial<ISettings>) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError("User not found", 404)
  }

  if (settings.notifications) {
    user.settings.notifications = { ...user.settings.notifications, ...settings.notifications }
  }
  if (settings.privacy) {
    user.settings.privacy = { ...user.settings.privacy, ...settings.privacy }
  }
  if (settings.display) {
    user.settings.display = { ...user.settings.display, ...settings.display }
  }

  await user.save()
  return user.settings
}

export const deleteAccount = async (userId: string) => {
  const files = await File.find({ owner: userId })
  for (const file of files) {
    if (file.filePath) {
      const fullPath = path.join(process.cwd(), file.filePath)
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
      }
    }
  }

  await Promise.all([
    File.deleteMany({ owner: userId }),
    Folder.deleteMany({ owner: userId }),
    User.findByIdAndDelete(userId),
  ])
}
