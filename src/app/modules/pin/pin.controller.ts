import type { Response } from "express"
import * as PinService from "./pin.service"
import type { AuthRequest } from "../auth/auth.middleware"
import { asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"
import { AppError } from "../../middlewares/error.middleware"

export const setPin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { pin, confirmPin } = req.body

  if (pin !== confirmPin) {
    throw new AppError("PINs do not match", 400)
  }

  if (!/^\d{4,6}$/.test(pin)) {
    throw new AppError("PIN must be 4-6 digits", 400)
  }

  await PinService.updatePin(user._id as string, pin)
  sendSuccess(res, null, "PIN set successfully")
})

export const verifyPin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { pin } = req.body

  if (!pin || !/^\d{4,6}$/.test(pin)) {
    throw new AppError("Invalid PIN format", 400)
  }

  const result = await PinService.verifyUserPin(user._id as string, pin)
  sendSuccess(res, { sessionToken: result.sessionToken }, "PIN verified successfully")
})

export const getPinStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const isPinSet = await PinService.checkPinStatus(user._id as string)
  sendSuccess(res, { isPinSet })
})

export const removePin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { currentPin } = req.body

  if (!currentPin) {
    throw new AppError("Current PIN is required", 400)
  }

  await PinService.removePin(user._id as string, currentPin)
  sendSuccess(res, null, "PIN removed successfully")
})
