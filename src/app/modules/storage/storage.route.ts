import { Router } from "express"
import * as StorageController from "./storage.controller"
import { auth } from "../auth/auth.middleware"

const router = Router()

router.use(auth)

router.get("/", StorageController.getStorageStats)
router.post("/check", StorageController.checkLimitBeforeUpload)

export const StorageRoutes = router
