import User from "../auth/auth.model"
import { hashPassword, comparePassword } from "../auth/auth.utils"
import { AppError } from "../../middlewares/error.middleware"
import jwt from "jsonwebtoken"

export const updatePin = async (userId: string, pin: string) => {
  const hashedPin = await hashPassword(pin)
  const user = await User.findByIdAndUpdate(userId, { pinCode: hashedPin }, { new: true })

  if (!user) {
    throw new AppError("User not found", 404)
  }

  return user
}

export const verifyUserPin = async (userId: string, pin: string) => {
  const user = await User.findById(userId).select("+pinCode")

  if (!user) {
    throw new AppError("User not found", 404)
  }

  if (!user.pinCode) {
    throw new AppError("PIN not set. Please set a PIN first", 400)
  }

  const isMatch = await comparePassword(pin, user.pinCode)
  if (!isMatch) {
    throw new AppError("Invalid PIN", 401)
  }

  const sessionToken = jwt.sign({ id: user._id, email: user.email, pinVerified: true }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  })

  return { sessionToken }
}

export const checkPinStatus = async (userId: string) => {
  const user = await User.findById(userId).select("+pinCode")
  if (!user) {
    throw new AppError("User not found", 404)
  }
  return !!(user && user.pinCode)
}

export const removePin = async (userId: string, currentPin: string) => {
  const user = await User.findById(userId).select("+pinCode")

  if (!user) {
    throw new AppError("User not found", 404)
  }

  if (!user.pinCode) {
    throw new AppError("No PIN is set", 400)
  }

  const isMatch = await comparePassword(currentPin, user.pinCode)
  if (!isMatch) {
    throw new AppError("Invalid current PIN", 401)
  }

  user.pinCode = undefined
  await user.save()
}
