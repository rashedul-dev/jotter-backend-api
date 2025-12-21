import { Router } from "express"
import * as PinController from "./pin.controller"
import { auth } from "../auth/auth.middleware"
import { rateLimit } from "../../middlewares/rate-limit.middleware"

const router = Router()

router.use(auth)

const pinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many PIN attempts. Please try again later",
})

router.post("/set", pinLimiter, PinController.setPin)
router.post("/verify", pinLimiter, PinController.verifyPin)
router.get("/status", PinController.getPinStatus)
router.delete("/remove", pinLimiter, PinController.removePin)

export const PinRoutes = router
