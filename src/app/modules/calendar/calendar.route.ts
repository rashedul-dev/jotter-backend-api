import { Router } from "express"
import * as CalendarController from "./calendar.controller"
import { auth } from "../auth/auth.middleware"

const router = Router()

router.use(auth)

router.get("/", CalendarController.getCalendarData)
router.get("/date", CalendarController.getDayActivities)
router.get("/:date", CalendarController.getDayActivities)

export const CalendarRoutes = router