import type { Response } from "express";
import * as FolderService from "./folder.service";
import type { AuthRequest } from "../auth/auth.middleware";
import { logActivity } from "../activity/activity.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middlewares/error.middleware";

export const createFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { name, parentFolder, isPrivate } = req.body;

  if (!name || name.trim().length === 0) {
    throw new AppError("Folder name is required", 400);
  }

  // If setting as private, verify user has PIN
  if (isPrivate) {
    const User = (await import("../auth/auth.model")).default;
    const userData = await User.findById(user._id).select("+pinCode");
    if (!userData?.pinCode) {
      throw new AppError("PIN must be set before creating private folders", 400);
    }
  }

  const folder = await FolderService.createFolder({
    name,
    owner: user._id as any,
    parentFolder: parentFolder || undefined,
    isPrivate: isPrivate || false,
  });

  await logActivity(user._id as string, "created", "folder" as any, folder._id as string, folder.name);
  sendSuccess(res, { folder }, "Folder created successfully", 201);
});

export const getFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { parentFolder, includePrivate } = req.query;

  const folders = await FolderService.getFolders(user._id as string, parentFolder as string, includePrivate === "true");
  sendSuccess(res, { folders });
});

export const getFolderDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const folder = await FolderService.getFolderById(req.params.id, user._id as string);

  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  const { childFolders, files } = await FolderService.getChildResources(folder._id as string, user._id as string);

  sendSuccess(res, {
    folder,
    childFolders,
    files,
    breadcrumb: await FolderService.getFolderBreadcrumb(folder._id as string, user._id as string),
  });
});

export const updateFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const updates = req.body;

  // If making folder private, verify PIN is set
  if (updates.isPrivate === true) {
    const User = (await import("../auth/auth.model")).default;
    const userData = await User.findById(user._id).select("+pinCode");
    if (!userData?.pinCode) {
      throw new AppError("PIN must be set before making folders private", 400);
    }
  }

  const folder = await FolderService.updateFolder(req.params.id, user._id as string, updates);

  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  await logActivity(user._id as string, "updated", "folder" as any, folder._id as string, folder.name);
  sendSuccess(res, { folder }, "Folder updated successfully");
});

export const deleteFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const folder = await FolderService.getFolderById(req.params.id, user._id as string);

  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  await FolderService.deleteFolder(req.params.id, user._id as string);
  await logActivity(user._id as string, "deleted", "folder" as any, req.params.id, folder.name);
  sendSuccess(res, null, "Folder and all contents deleted successfully");
});

export const moveFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { newParentId } = req.body;

  const folder = await FolderService.moveFolder(req.params.id, user._id as string, newParentId);
  await logActivity(user._id as string, "moved", "folder" as any, folder._id as string, folder.name);
  sendSuccess(res, { folder }, "Folder moved successfully");
});

export const renameFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { newName } = req.body;

  if (!newName || newName.trim().length === 0) {
    throw new AppError("New folder name is required", 400);
  }

  const folder = await FolderService.renameFolder(req.params.id, user._id as string, newName.trim());
  await logActivity(user._id as string, "updated", "folder" as any, folder._id as string, `Renamed to ${newName}`);
  sendSuccess(res, { folder }, "Folder renamed successfully");
});

export const togglePrivate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const isPrivate = await FolderService.togglePrivate(req.params.id, user._id as string);
  sendSuccess(res, { isPrivate }, `Folder ${isPrivate ? "moved to" : "removed from"} private space`);
});
