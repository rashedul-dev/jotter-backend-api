import File from "./file.model";
import { checkStorageLimit } from "../storage/storage.service";
import { logActivity } from "../activity/activity.service";
import { AppError } from "../../middlewares/error.middleware";
import fs from "fs";
import sharp from "sharp";
import pdf from "pdf-parse";
import { Express } from "express-serve-static-core";

export const extractMetadata = async (filePath: string, type: "image" | "pdf") => {
  let metadata: any = {};

  try {
    const buffer = fs.readFileSync(filePath);

    if (type === "image") {
      const imageInfo = await sharp(buffer).metadata();
      metadata = {
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
      };
    } else if (type === "pdf") {
      const pdfParser = (pdf as any).default || pdf;
      const data = await pdfParser(buffer);
      metadata = {
        pages: data.numpages,
        info: data.info,
      };
    }
  } catch (error) {
    console.error("Metadata extraction error:", error);
  }

  return metadata;
};

export const createImageFile = async (
  userId: string,
  file: Express.Multer.File,
  title: string,
  folderId?: string,
  isPrivate = false,
  tags: string[] = []
) => {
  const canUpload = await checkStorageLimit(userId, file.size);
  if (!canUpload) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new AppError("Storage limit exceeded", 403);
  }

  const metadata = await extractMetadata(file.path, "image");

  const newFile = await File.create({
    type: "image",
    title,
    filename: file.filename,
    filePath: file.path,
    fileSize: file.size,
    owner: userId,
    folder: folderId || undefined,
    metadata,
    isPrivate,
    tags,
  });

  // Fix: Handle the array return type from create()
  const fileDoc = Array.isArray(newFile) ? newFile[0] : newFile;
  await logActivity(userId, "created", "image", fileDoc._id.toString(), fileDoc.title);
  return fileDoc;
};

export const createPdfFile = async (
  userId: string,
  file: Express.Multer.File,
  title: string,
  folderId?: string,
  isPrivate = false,
  tags: string[] = []
) => {
  const canUpload = await checkStorageLimit(userId, file.size);
  if (!canUpload) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new AppError("Storage limit exceeded", 403);
  }

  const metadata = await extractMetadata(file.path, "pdf");

  const newFile = await File.create({
    type: "pdf",
    title,
    filename: file.filename,
    filePath: file.path,
    fileSize: file.size,
    owner: userId,
    folder: folderId || undefined,
    metadata,
    isPrivate,
    tags,
  });

  // Fix: Handle the array return type from create()
  const fileDoc = Array.isArray(newFile) ? newFile[0] : newFile;
  await logActivity(userId, "created", "pdf", fileDoc._id.toString(), fileDoc.title);
  return fileDoc;
};

export const createNoteFile = async (
  userId: string,
  title: string,
  content: string,
  folderId?: string,
  isPrivate = false,
  tags: string[] = []
) => {
  const noteSize = Buffer.byteLength(content, "utf8");

  const canUpload = await checkStorageLimit(userId, noteSize);
  if (!canUpload) {
    throw new AppError("Storage limit exceeded", 403);
  }

  const newNote = await File.create({
    type: "note",
    title,
    fileSize: noteSize,
    owner: userId,
    folder: folderId || undefined,
    tags,
    isPrivate,
    metadata: { content },
  });

  // Fix: Handle the array return type from create()
  const noteDoc = Array.isArray(newNote) ? newNote[0] : newNote;
  await logActivity(userId, "created", "note", noteDoc._id.toString(), noteDoc.title);
  return noteDoc;
};

export const getFiles = async (query: any, skip: number, limit: number, sort: any) => {
  if (!("isPrivate" in query)) {
    query.isPrivate = false;
  }

  return await File.find(query).sort(sort).skip(skip).limit(limit).populate("folder", "name");
};

export const countFiles = async (query: any) => {
  if (!("isPrivate" in query)) {
    query.isPrivate = false;
  }
  return await File.countDocuments(query);
};

export const getFileById = async (fileId: string, userId: string) => {
  const file = await File.findOne({ _id: fileId, owner: userId }).populate("folder", "name");
  if (!file) {
    throw new AppError("File not found", 404);
  }
  await logActivity(userId, "viewed", file.type as any, file._id.toString(), file.title);
  return file;
};

export const updateFile = async (fileId: string, userId: string, updates: any) => {
  // Don't allow changing critical fields
  delete updates.owner;
  delete updates.fileSize;
  delete updates.filePath;
  delete updates.filename;

  // If updating note content, recalculate size
  if (updates.metadata?.content) {
    const newSize = Buffer.byteLength(updates.metadata.content, "utf8");
    const file = await File.findOne({ _id: fileId, owner: userId });
    if (!file) throw new AppError("File not found", 404);

    const sizeDiff = newSize - file.fileSize;
    if (sizeDiff > 0) {
      const canUpdate = await checkStorageLimit(userId, sizeDiff);
      if (!canUpdate) throw new AppError("Storage limit would be exceeded", 403);
    }

    updates.fileSize = newSize;
  }

  const file = await File.findOneAndUpdate({ _id: fileId, owner: userId }, updates, { new: true, runValidators: true });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  await logActivity(userId, "updated", file.type as any, file._id.toString(), file.title);
  return file;
};

export const deleteFile = async (fileId: string, userId: string) => {
  const file = await File.findOneAndDelete({ _id: fileId, owner: userId });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  if (file.filePath && fs.existsSync(file.filePath)) {
    fs.unlinkSync(file.filePath);
  }

  await logActivity(userId, "deleted", file.type as any, file._id.toString(), file.title);
};

export const toggleFavorite = async (fileId: string, userId: string) => {
  const file = await File.findOne({ _id: fileId, owner: userId });
  if (!file) {
    throw new AppError("File not found", 404);
  }

  file.isFavorite = !file.isFavorite;
  await file.save();

  await logActivity(userId, "favorited", file.type as any, file._id.toString(), file.title);
  return file.isFavorite;
};

export const copyFile = async (fileId: string, userId: string, destinationFolderId?: string) => {
  const file = await File.findOne({ _id: fileId, owner: userId });
  if (!file) {
    throw new AppError("File not found", 404);
  }

  // Create a copy of the file
  const fileCopy = file.toObject();
  delete fileCopy._id;
  delete fileCopy.createdAt;
  delete fileCopy.updatedAt;

  fileCopy.title = `${fileCopy.title} (Copy)`;
  fileCopy.folder = destinationFolderId || fileCopy.folder;
  fileCopy.isFavorite = false;

  // If it's an image or PDF, copy the physical file
  if (fileCopy.filePath && fs.existsSync(fileCopy.filePath)) {
    const ext = fileCopy.filename?.split(".").pop() || "file";
    const newFilename = `${Date.now()}-copy-${Math.random().toString(36).substring(7)}.${ext}`;
    const newPath = fileCopy.filePath.replace(fileCopy.filename!, newFilename);

    fs.copyFileSync(fileCopy.filePath, newPath);
    fileCopy.filename = newFilename;
    fileCopy.filePath = newPath;
  }

  // Check storage limit for the copy
  const canCopy = await checkStorageLimit(userId, fileCopy.fileSize);
  if (!canCopy) {
    // Clean up copied file if it exists
    if (fileCopy.filePath && fs.existsSync(fileCopy.filePath)) {
      fs.unlinkSync(fileCopy.filePath);
    }
    throw new AppError("Storage limit exceeded", 403);
  }

  const newFile = await File.create(fileCopy);

  // Fix: Handle the array return type from create()
  const newFileDoc = Array.isArray(newFile) ? newFile[0] : newFile;
  await logActivity(userId, "created", file.type as any, newFileDoc._id.toString(), `Copied ${newFileDoc.title}`);

  return newFileDoc;
};

export const duplicateFile = async (fileId: string, userId: string) => {
  // Duplicate is the same as copy but to the same folder
  const file = await File.findOne({ _id: fileId, owner: userId });
  if (!file) {
    throw new AppError("File not found", 404);
  }

  return await copyFile(fileId, userId, file.folder as any);
};

export const shareFile = async (fileId: string, userId: string, shareWith: string[]) => {
  const file = await File.findOne({ _id: fileId, owner: userId });
  if (!file) {
    throw new AppError("File not found", 404);
  }

  // For now, we'll generate a simple share token
  // In production, you might want to create a separate SharedFile collection
  const shareToken = `${fileId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  await logActivity(userId, "updated", file.type as any, file._id.toString(), `Shared ${file.title}`);

  return {
    shareToken,
    shareUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/shared/${shareToken}`,
    sharedWith: shareWith,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };
};

export const togglePrivate = async (fileId: string, userId: string) => {
  const file = await File.findOne({ _id: fileId, owner: userId });
  if (!file) {
    throw new AppError("File not found", 404);
  }

  // If setting to private, verify user has PIN
  if (!file.isPrivate) {
    const User = (await import("../auth/auth.model")).default;
    const user = await User.findById(userId).select("+pinCode");
    if (!user?.pinCode) {
      throw new AppError("PIN must be set before moving files to private space", 400);
    }
  }

  file.isPrivate = !file.isPrivate;
  await file.save();

  await logActivity(
    userId,
    "updated",
    file.type as any,
    file._id as any,
    `${file.isPrivate ? "Moved to" : "Removed from"} private space`
  );
  return file.isPrivate;
};
