import { Router } from "express"
import * as FolderController from "./folder.controller"
import { auth } from "../auth/auth.middleware"
import { requirePinForPrivate } from "../../middlewares/validation.middleware"

const router = Router()

router.use(auth)

router.post("/", FolderController.createFolder)
router.get("/", FolderController.getFolders)
router.get("/:id", requirePinForPrivate, FolderController.getFolderDetails)
router.put("/:id", requirePinForPrivate, FolderController.updateFolder)
router.delete("/:id", requirePinForPrivate, FolderController.deleteFolder)
router.patch("/:id/move", FolderController.moveFolder)
router.patch("/:id/rename", FolderController.renameFolder)
router.patch("/:id/private", FolderController.togglePrivate)

export const FolderRoutes = router