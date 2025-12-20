import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "./auth.model"
import { AppError } from "../../middlewares/error.middleware"

export interface AuthRequest extends Request {
  user?: any
  file?: any
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      throw new AppError("Authentication required. Please provide a valid token", 401)
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      throw new AppError("User not found or has been deleted", 401)
    }

    if (!user.isEmailVerified) {
      throw new AppError("Please verify your email to access this resource", 403)
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
    } else if ((error as any).name === "JsonWebTokenError") {
      next(new AppError("Invalid token. Please login again", 401))
    } else if ((error as any).name === "TokenExpiredError") {
      next(new AppError("Token expired. Please login again", 401))
    } else {
      next(new AppError("Authentication failed", 401))
    }
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
      const user = await User.findById(decoded.id).select("-password")
      if (user) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Silently fail for optional auth
    next()
  }
}
