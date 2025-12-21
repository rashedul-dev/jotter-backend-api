import { Router } from "express"
import * as UserController from "./user.controller"
import { auth } from "../auth/auth.middleware"
import { upload } from "../../middlewares/upload"

const router = Router()

router.use(auth)

router.get("/profile", UserController.getProfile)
router.put("/profile", UserController.updateProfile)
router.post("/profile/image", upload.single("image"), UserController.uploadProfileImage)
router.delete("/profile/image", UserController.removeProfileImage)

router.get("/settings", UserController.getSettings)
router.put("/settings", UserController.updateSettings)

router.get("/stats", UserController.getUserStats)
router.get("/me", UserController.getMe)
router.delete("/account", UserController.deleteAccount)

export const UserRoutes = router
