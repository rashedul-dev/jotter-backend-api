import { Router } from "express"
import * as SearchController from "./search.controller"
import { auth } from "../auth/auth.middleware"

const router = Router()

router.use(auth)

router.get("/", SearchController.globalSearch)
router.get("/tag/:tag", SearchController.searchByTag)

export const SearchRoutes = router
