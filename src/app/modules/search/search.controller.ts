import type { Response } from "express"
import * as SearchService from "./search.service"
import type { AuthRequest } from "../auth/auth.middleware"
import { asyncHandler } from "../../middlewares/error.middleware"
import { sendSuccess } from "../../utils/response"
import { AppError } from "../../middlewares/error.middleware"

export const globalSearch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const q = req.query.q as string
  const type = req.query.type as string

  if (!q || q.trim().length === 0) {
    throw new AppError("Search query is required", 400)
  }

  const { files, folders } = await SearchService.performGlobalSearch(user._id as string, q, type)

  sendSuccess(res, {
    query: q,
    results: {
      files,
      folders,
      totalResults: files.length + folders.length,
    },
  })
})

export const searchByTag = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { tag } = req.params

  if (!tag || tag.trim().length === 0) {
    throw new AppError("Tag is required", 400)
  }

  const files = await SearchService.searchByTag(user._id as string, tag)

  sendSuccess(res, { tag, files })
})
