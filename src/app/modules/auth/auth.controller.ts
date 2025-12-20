import type { Request, Response, NextFunction } from "express"
import { asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"
import * as AuthService from "./auth.service"
import type { AuthRequest } from "./auth.middleware"

export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body
  await AuthService.forgotPasswordService(email)
  sendSuccess(res, null, "Password reset code sent to your email")
})

export const verifyResetCode = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, code } = req.body
  const resetToken = await AuthService.verifyResetCodeService(email, code)
  sendSuccess(res, { resetToken }, "Code verified successfully")
})

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { resetToken, newPassword } = req.body
  await AuthService.resetPasswordService(resetToken, newPassword)
  sendSuccess(res, null, "Password updated successfully")
})

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await AuthService.registerUserService(req.body)
  sendSuccess(res, null, "Verification email sent. Please check your inbox.", 201)
})

export const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, code } = req.body
  const { token, user } = await AuthService.verifyEmailService(email, code)
  sendSuccess(
    res,
    {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    },
    "Email verified successfully",
  )
})

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  const { token, user } = await AuthService.loginUserService(email, password)
  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      usedStorage: user.usedStorage,
      storageLimit: user.storageLimit,
    },
  })
})

export const resendVerification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body
  await AuthService.resendVerificationService(email)
  sendSuccess(res, null, "Verification code resent successfully")
})

export const logoutUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // However, we can log the activity for audit purposes
  const user = req.user
  sendSuccess(res, null, "Logged out successfully")
})
