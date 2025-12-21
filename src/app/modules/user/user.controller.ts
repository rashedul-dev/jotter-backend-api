import type { Response } from "express"
import * as UserService from "./user.service"
import type { AuthRequest } from "../auth/auth.middleware"
import { asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const profile = await UserService.getProfileById(user._id as string)
  sendSuccess(res, { user: profile })
})

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { username, profileImage } = req.body
  const updatedUser = await UserService.updateProfileInfo(user._id as string, { username, profileImage })
  sendSuccess(res, { user: updatedUser }, "Profile updated successfully")
})

export const uploadProfileImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  if (!req.file) {
    return sendSuccess(res, null, "Please upload an image", 400)
  }
  const profileImage = `/uploads/${req.file.filename}`
  const updatedUser = await UserService.updateProfileInfo(user._id as string, { profileImage })
  sendSuccess(res, { user: updatedUser }, "Profile image uploaded successfully")
})

export const removeProfileImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  await UserService.deleteProfileImage(user._id as string)
  sendSuccess(res, null, "Profile image removed successfully")
})

export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const stats = await UserService.getUserStatistics(user._id as string, user.createdAt)
  sendSuccess(res, { stats })
})

export const getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const settings = await UserService.getSettings(user._id as string)
  sendSuccess(res, { settings })
})

export const updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const settings = await UserService.updateSettings(user._id as string, req.body)
  sendSuccess(res, { settings }, "Settings updated successfully")
})

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  await UserService.deleteAccount(user._id as string)
  sendSuccess(res, null, "Account deleted successfully. We're sorry to see you go.")
})

export const getMe = getProfile
