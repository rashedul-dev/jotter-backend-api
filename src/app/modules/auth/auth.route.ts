import express from "express"
import {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendVerification,
  logoutUser, // Import logout controller
} from "./auth.controller"
import { rateLimit } from "../../middlewares/rate-limit.middleware"
import { auth } from "./auth.middleware" // Import auth middleware for logout

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many authentication attempts. Please try again later",
})

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 emails
  message: "Too many email requests. Please try again later",
})

router.post("/register", authLimiter, registerUser)
router.post("/verify-email", authLimiter, verifyEmail)
router.post("/login", authLimiter, loginUser)
router.post("/forgot-password", emailLimiter, forgotPassword)
router.post("/verify-reset-code", authLimiter, verifyResetCode)
router.post("/reset-password", authLimiter, resetPassword)
router.post("/resend-verification", emailLimiter, resendVerification)
router.post("/logout", auth, logoutUser)

export const AuthRoutes = router
