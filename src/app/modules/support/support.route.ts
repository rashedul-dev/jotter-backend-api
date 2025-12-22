import { Router } from "express"
import * as SupportController from "./support.controller"
import { auth } from "../auth/auth.middleware"
import { upload } from "../../middlewares/upload"

const router = Router()

router.get("/contact", SupportController.getContactInfo)
router.get("/faq", SupportController.getFAQs)

router.use(auth)
router.post("/request", upload.array("attachments", 5), SupportController.createSupportRequest)
router.get("/requests", SupportController.getSupportRequests)
router.get("/requests/:id", SupportController.getSupportRequestDetails)

export const SupportRoutes = router
