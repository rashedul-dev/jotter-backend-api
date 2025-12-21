import Folder from "./folder.model";
import File from "../files/file.model";
import type { IFolder } from "../../interfaces/models";
import { AppError } from "../../middlewares/error.middleware";
import fs from "fs";
import User from "../auth/auth.model";

export const createFolder = async (folderData: Partial<IFolder>) => {
  // Validate parent folder if provided
  if (folderData.parentFolder) {
    const parent = await Folder.findById(folderData.parentFolder);
    if (!parent) {
      throw new AppError("Parent folder not found", 404);
    }
    if (parent.owner.toString() !== folderData.owner?.toString()) {
      throw new AppError("Parent folder does not belong to user", 403);
    }
  }

  // Check for duplicate name in same parent
  const existing = await Folder.findOne({
    name: folderData.name,
    owner: folderData.owner,
    parentFolder: folderData.parentFolder || { $exists: false },
  });

  if (existing) {
    throw new AppError("A folder with this name already exists in this location", 409);
  }

  return await Folder.create(folderData);
};

export const getFolders = async (owner: string, parentFolder?: string, includePrivate = false) => {
  const query: any = { owner };

  // Default to non-private folders unless explicitly requested
  if (!includePrivate) {
    query.isPrivate = false;
  }

  if (parentFolder) {
    query.parentFolder = parentFolder;
  } else {
    query.parentFolder = { $exists: false };
  }
  return await Folder.find(query).sort({ name: 1 });
};

export const getFolderById = async (id: string, owner: string) => {
  const folder = await Folder.findOne({ _id: id, owner });
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }
  return folder;
};

export const updateFolder = async (id: string, owner: string, updates: Partial<IFolder>) => {
  // Don't allow changing owner or critical fields
  delete (updates as any).owner;
  delete (updates as any).totalItems;
  delete (updates as any).storageUsed;

  const folder = await Folder.findOneAndUpdate({ _id: id, owner }, updates, {
    new: true,
    runValidators: true,
  });

  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  // If privacy changed, cascade to child files
  if (updates.isPrivate !== undefined) {
    await File.updateMany({ folder: id, owner }, { isPrivate: updates.isPrivate });
  }

  return folder;
};

export const deleteFolder = async (id: string, owner: string) => {
  const folder = await Folder.findOne({ _id: id, owner });
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  // Get all files in folder and delete physical files
  const files = await File.find({ folder: id, owner });
  for (const file of files) {
    if (file.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }
  }

  // Delete all files in folder
  await File.deleteMany({ folder: id, owner });

  // Recursively delete subfolders
  const subfolders = await Folder.find({ parentFolder: id, owner });
  for (const sub of subfolders) {
    await deleteFolder(sub._id.toString(), owner);
  }

  // Delete the folder itself
  await Folder.deleteOne({ _id: id });
};

export const getChildResources = async (folderId: string, owner: string) => {
  const childFolders = await Folder.find({ parentFolder: folderId, owner }).sort({ name: 1 });
  const files = await File.find({ folder: folderId, owner }).sort({ createdAt: -1 });
  return { childFolders, files };
};

export const getFolderBreadcrumb = async (folderId: string, owner: string) => {
  const breadcrumb = [];
  let currentFolder = await Folder.findOne({ _id: folderId, owner });

  while (currentFolder) {
    breadcrumb.unshift({
      id: currentFolder._id,
      name: currentFolder.name,
    });

    if (currentFolder.parentFolder) {
      currentFolder = await Folder.findOne({
        _id: currentFolder.parentFolder,
        owner,
      });
    } else {
      currentFolder = null;
    }
  }

  return breadcrumb;
};

export const moveFolder = async (folderId: string, owner: string, newParentId?: string) => {
  const folder = await getFolderById(folderId, owner);

  // Validate new parent
  if (newParentId) {
    const newParent = await Folder.findById(newParentId);
    if (!newParent) {
      throw new AppError("Target folder not found", 404);
    }
    if (newParent.owner.toString() !== owner) {
      throw new AppError("Target folder does not belong to user", 403);
    }

    // Prevent circular reference
    if (newParentId === folderId) {
      throw new AppError("Cannot move folder into itself", 400);
    }

    // Check if newParent is a descendant of current folder
    let checkParent = newParent;
    while (checkParent.parentFolder) {
      if (checkParent.parentFolder.toString() === folderId) {
        throw new AppError("Cannot move folder into its own subfolder", 400);
      }
      checkParent = (await Folder.findById(checkParent.parentFolder)) as any;
      if (!checkParent) break;
    }
  }

  folder.parentFolder = newParentId as any;
  await folder.save();
  return folder;
};

export const renameFolder = async (folderId: string, owner: string, newName: string) => {
  const folder = await Folder.findOne({ _id: folderId, owner });
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  // Check if a folder with the new name already exists in the same parent
  const existing = await Folder.findOne({
    name: newName,
    owner,
    parentFolder: folder.parentFolder || { $exists: false },
    _id: { $ne: folderId },
  });

  if (existing) {
    throw new AppError("A folder with this name already exists in this location", 409);
  }

  folder.name = newName;
  await folder.save();

  return folder;
};

export const togglePrivate = async (folderId: string, owner: string) => {
  const folder = await Folder.findOne({ _id: folderId, owner });
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  // If setting to private, verify user has PIN
  if (!folder.isPrivate) {
    const user = await User.findById(owner).select("+pinCode");
    if (!user?.pinCode) {
      throw new AppError("PIN must be set before moving folders to private space", 400);
    }
  }

  folder.isPrivate = !folder.isPrivate;
  await folder.save();

  // Cascade privacy change to all files and subfolders
  await File.updateMany({ folder: folderId, owner }, { isPrivate: folder.isPrivate });

  const subfolders = await Folder.find({ parentFolder: folderId, owner });
  for (const sub of subfolders) {
    await togglePrivate(sub._id.toString(), owner);
  }

  return folder.isPrivate;
};
