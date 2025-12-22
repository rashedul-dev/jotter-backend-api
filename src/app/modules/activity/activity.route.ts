import { Router } from "express"
import * as ActivityController from "./activity.controller"
import { auth } from "../auth/auth.middleware"

const router = Router()

router.use(auth)

router.get("/", ActivityController.getActivities)
router.get("/recent", ActivityController.getRecentActivity)
router.delete("/clear", ActivityController.clearOldActivities)

export const ActivityRoutes = router
