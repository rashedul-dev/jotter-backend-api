import { Router } from "express"
import * as FileController from "./file.controller"
import { auth } from "../auth/auth.middleware"
import { upload } from "../../middlewares/upload"
import { checkStorageLimit } from "../../middlewares/validation.middleware"

const router = Router()

router.use(auth)

router.post("/upload/image", upload.single("file"), checkStorageLimit, FileController.uploadImage)
router.post("/upload/pdf", upload.single("file"), checkStorageLimit, FileController.uploadPdf)
router.post("/note", FileController.createNote)

router.get("/", FileController.getFiles)
router.get("/filter/images", FileController.getImages)
router.get("/filter/pdfs", FileController.getPdfs)
router.get("/filter/notes", FileController.getNotes)
router.get("/filter/favorites", FileController.getFavorites)

router.get("/:id", FileController.getFileDetails)
router.get("/:id/download", FileController.downloadFile)
router.put("/:id", FileController.updateFile)
router.delete("/:id", FileController.deleteFile)
router.patch("/:id/favorite", FileController.toggleFavorite)
router.patch("/:id/private", FileController.togglePrivate)
router.post("/:id/copy", FileController.copyFile)
router.post("/:id/duplicate", FileController.duplicateFile)
router.post("/:id/share", FileController.shareFile)

export const FileRoutes = router