import type { Response } from "express"
import type { AuthRequest } from "../auth/auth.middleware"
import * as StorageService from "./storage.service"
import User from "../auth/auth.model"
import { asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"
import { AppError } from "../../middlewares/error.middleware"

export const getStorageStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const breakdown = await StorageService.calculateStorageBreakdown(user._id as string)
  const dbUser = await User.findById(user._id)

  if (!dbUser) {
    throw new AppError("User not found", 404)
  }

  const percentageUsed = ((dbUser.usedStorage / dbUser.storageLimit) * 100).toFixed(2)
  const storageData = {
    total: dbUser.storageLimit,
    used: dbUser.usedStorage,
    available: dbUser.storageLimit - dbUser.usedStorage,
    percentageUsed: Number.parseFloat(percentageUsed),
    breakdown,
    warnings: getStorageWarnings(Number.parseFloat(percentageUsed)),
  }

  sendSuccess(res, storageData)
})

export const checkLimitBeforeUpload = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { fileSize } = req.body

  if (!fileSize || typeof fileSize !== "number") {
    throw new AppError("File size is required", 400)
  }

  const canUpload = await StorageService.checkStorageLimit(user._id as string, fileSize)
  const dbUser = await User.findById(user._id)

  if (!dbUser) {
    throw new AppError("User not found", 404)
  }

  const available = dbUser.storageLimit - dbUser.usedStorage

  sendSuccess(res, {
    allowed: canUpload,
    available,
    requested: fileSize,
    message: canUpload
      ? "Upload allowed"
      : `Storage limit exceeded. ${formatBytes(available)} available, ${formatBytes(fileSize)} requested`,
  })
})

// Helper to get storage warnings
const getStorageWarnings = (percentageUsed: number) => {
  const warnings = []
  if (percentageUsed >= 95) {
    warnings.push({ level: "critical", message: "Storage almost full! Only 5% remaining." })
  } else if (percentageUsed >= 90) {
    warnings.push({ level: "high", message: "Storage usage is at 90%. Consider cleaning up files." })
  } else if (percentageUsed >= 80) {
    warnings.push({ level: "medium", message: "Storage usage is at 80%." })
  }
  return warnings
}

// Helper to format bytes
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
