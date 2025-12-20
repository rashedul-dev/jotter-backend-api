import type { Request, Response, NextFunction } from "express"
import { AppError } from "./error.middleware"
import type { Express } from "express" // Import Express to declare it

// Validation helper
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const messages = error.details.map((detail: any) => detail.message).join(", ")
      return next(new AppError(messages, 400))
    }

    req.body = value
    next()
  }
}

// Storage limit check middleware
export const checkStorageLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user
    if (!user) {
      return next(new AppError("Unauthorized", 401))
    }

    const fileSize = req.file?.size || 0
    const files = (req.files as Express.Multer.File[]) || []
    const totalSize = fileSize + files.reduce((sum, f) => sum + f.size, 0)

    const User = (await import("../modules/auth/auth.model")).default
    const userData = await User.findById(user.id)

    if (!userData) {
      return next(new AppError("User not found", 404))
    }

    const remainingStorage = userData.storageLimit - userData.usedStorage

    if (totalSize > remainingStorage) {
      return next(
        new AppError(
          `Storage limit exceeded. You have ${(remainingStorage / (1024 * 1024)).toFixed(2)}MB available, but requested ${(totalSize / (1024 * 1024)).toFixed(2)}MB`,
          403,
        ),
      )
    }

    next()
  } catch (error) {
    next(error)
  }
}

// PIN verification middleware
export const requirePinVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return next(new AppError("No token provided", 401))
    }

    const jwt = require("jsonwebtoken")
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded.pinVerified) {
      return next(new AppError("PIN verification required", 403))
    }

    next()
  } catch (error) {
    next(error)
  }
}

// Check if resource is private and requires PIN
export const requirePinForPrivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resourceType = req.baseUrl.includes("folder") ? "folder" : "file"
    const resourceId = req.params.id

    if (!resourceId) {
      return next()
    }

    let model
    if (resourceType === "folder") {
      model = (await import("../modules/folders/folder.model")).default
    } else {
      model = (await import("../modules/files/file.model")).default
    }

    const resource = await model.findById(resourceId)
    if (!resource) {
      return next(new AppError(`${resourceType} not found`, 404))
    }

    if (resource.isPrivate) {
      return requirePinVerification(req, res, next)
    }

    next()
  } catch (error) {
    next(error)
  }
}
