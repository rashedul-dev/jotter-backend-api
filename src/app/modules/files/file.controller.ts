import type { Response } from "express"
import type { AuthRequest } from "../auth/auth.middleware"
import * as FileService from "./file.service"
import { asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"
import { AppError } from "../../middlewares/error.middleware"
import { getPaginationMeta } from "../../utils/response"

export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const file = req.file

  if (!file) {
    throw new AppError("No file uploaded", 400)
  }

  const { folderId, title, isPrivate, tags } = req.body
  const tagArray = tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim())) : []

  const newFile = await FileService.createImageFile(
    user._id as string,
    file,
    title || file.originalname,
    folderId,
    isPrivate === "true" || isPrivate === true,
    tagArray,
  )

  sendSuccess(res, { file: newFile }, "Image uploaded successfully", 201)
})

export const uploadPdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const file = req.file

  if (!file) {
    throw new AppError("No file uploaded", 400)
  }

  const { folderId, title, isPrivate, tags } = req.body
  const tagArray = tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim())) : []

  const newFile = await FileService.createPdfFile(
    user._id as string,
    file,
    title || file.originalname,
    folderId,
    isPrivate === "true" || isPrivate === true,
    tagArray,
  )

  sendSuccess(res, { file: newFile }, "PDF uploaded successfully", 201)
})

export const createNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { title, content, folderId, tags, isPrivate } = req.body

  if (!title || !content) {
    throw new AppError("Title and content are required", 400)
  }

  const newNote = await FileService.createNoteFile(
    user._id as string,
    title,
    content,
    folderId,
    isPrivate || false,
    tags || [],
  )

  sendSuccess(res, { file: newNote }, "Note created successfully", 201)
})

export const getFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const {
    type,
    folderId,
    isFavorite,
    page = "1",
    limit = "20",
    sort = "createdAt",
    order = "desc",
    includePrivate,
  } = req.query

  const query: any = { owner: user._id }

  if (includePrivate === "true") {
    // PIN verification should be handled by middleware
    query.isPrivate = true
  } else {
    query.isPrivate = false
  }

  if (type) query.type = type
  if (folderId) {
    query.folder = folderId === "null" ? null : folderId
  }
  if (isFavorite === "true") query.isFavorite = true

  const pageNum = Number.parseInt(page as string)
  const limitNum = Number.parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  const sortOrder = order === "asc" ? 1 : -1
  const sortObj: any = {}
  sortObj[sort as string] = sortOrder

  const [files, total] = await Promise.all([
    FileService.getFiles(query, skip, limitNum, sortObj),
    FileService.countFiles(query),
  ])

  const meta = getPaginationMeta(total, pageNum, limitNum)
  sendSuccess(res, { files }, undefined, 200, meta)
})

export const getFileDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const file = await FileService.getFileById(req.params.id, user._id as string)
  sendSuccess(res, { file })
})

export const updateFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const updates = req.body
  const file = await FileService.updateFile(req.params.id, user._id as string, updates)
  sendSuccess(res, { file }, "File updated successfully")
})

export const deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  await FileService.deleteFile(req.params.id, user._id as string)
  sendSuccess(res, null, "File deleted successfully")
})

export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const isFavorite = await FileService.toggleFavorite(req.params.id, user._id as string)
  sendSuccess(res, { isFavorite }, `${isFavorite ? "Added to" : "Removed from"} favorites`)
})

export const downloadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const file = await FileService.getFileById(req.params.id, user._id as string)

  if (!file.filePath) {
    throw new AppError("File not downloadable", 400)
  }

  res.download(file.filePath, file.filename || file.title)
})

export const getImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { page = "1", limit = "20", sort = "createdAt", order = "desc", isFavorite } = req.query

  const query: any = { owner: user._id, type: "image" }
  if (isFavorite === "true") query.isFavorite = true

  const pageNum = Number.parseInt(page as string)
  const limitNum = Number.parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  const sortOrder = order === "asc" ? 1 : -1
  const sortObj: any = {}
  sortObj[sort as string] = sortOrder

  const [files, total] = await Promise.all([
    FileService.getFiles(query, skip, limitNum, sortObj),
    FileService.countFiles(query),
  ])

  const meta = getPaginationMeta(total, pageNum, limitNum)
  sendSuccess(res, { files }, undefined, 200, meta)
})

export const getPdfs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { page = "1", limit = "20", sort = "createdAt", order = "desc", isFavorite } = req.query

  const query: any = { owner: user._id, type: "pdf" }
  if (isFavorite === "true") query.isFavorite = true

  const pageNum = Number.parseInt(page as string)
  const limitNum = Number.parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  const sortOrder = order === "asc" ? 1 : -1
  const sortObj: any = {}
  sortObj[sort as string] = sortOrder

  const [files, total] = await Promise.all([
    FileService.getFiles(query, skip, limitNum, sortObj),
    FileService.countFiles(query),
  ])

  const meta = getPaginationMeta(total, pageNum, limitNum)
  sendSuccess(res, { files }, undefined, 200, meta)
})

export const getNotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { page = "1", limit = "20", sort = "createdAt", order = "desc", isFavorite } = req.query

  const query: any = { owner: user._id, type: "note" }
  if (isFavorite === "true") query.isFavorite = true

  const pageNum = Number.parseInt(page as string)
  const limitNum = Number.parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  const sortOrder = order === "asc" ? 1 : -1
  const sortObj: any = {}
  sortObj[sort as string] = sortOrder

  const [files, total] = await Promise.all([
    FileService.getFiles(query, skip, limitNum, sortObj),
    FileService.countFiles(query),
  ])

  const meta = getPaginationMeta(total, pageNum, limitNum)
  sendSuccess(res, { files }, undefined, 200, meta)
})

export const getFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { page = "1", limit = "20", sort = "createdAt", order = "desc", type } = req.query

  const query: any = { owner: user._id, isFavorite: true }
  if (type) query.type = type

  const pageNum = Number.parseInt(page as string)
  const limitNum = Number.parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  const sortOrder = order === "asc" ? 1 : -1
  const sortObj: any = {}
  sortObj[sort as string] = sortOrder

  const [files, total] = await Promise.all([
    FileService.getFiles(query, skip, limitNum, sortObj),
    FileService.countFiles(query),
  ])

  const meta = getPaginationMeta(total, pageNum, limitNum)
  sendSuccess(res, { files }, undefined, 200, meta)
})

export const copyFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { destinationFolderId } = req.body

  const copiedFile = await FileService.copyFile(req.params.id, user._id as string, destinationFolderId)
  sendSuccess(res, { file: copiedFile }, "File copied successfully", 201)
})

export const duplicateFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user

  const duplicatedFile = await FileService.duplicateFile(req.params.id, user._id as string)
  sendSuccess(res, { file: duplicatedFile }, "File duplicated successfully", 201)
})

export const shareFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { shareWith } = req.body

  if (!shareWith || !Array.isArray(shareWith)) {
    throw new AppError("shareWith must be an array of user emails or IDs", 400)
  }

  const shareInfo = await FileService.shareFile(req.params.id, user._id as string, shareWith)
  sendSuccess(res, shareInfo, "File share link generated successfully")
})

export const togglePrivate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const isPrivate = await FileService.togglePrivate(req.params.id, user._id as string)
  sendSuccess(res, { isPrivate }, `File ${isPrivate ? "moved to" : "removed from"} private space`)
})
