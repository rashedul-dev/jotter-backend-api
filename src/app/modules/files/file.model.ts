import mongoose, { Schema } from "mongoose";
import { IFile } from "../../interfaces/models";
import User from "../auth/auth.model";
import Folder from "../folders/folder.model";

const FileSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["note", "image", "pdf"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    filename: String,
    filePath: String,
    fileSize: {
      type: Number,
      required: true,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    metadata: {
      type: Schema.Types.Mixed,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hooks for storage and item counting
FileSchema.post("save", async function (doc: any) {
  await User.findByIdAndUpdate(doc.owner, { $inc: { usedStorage: doc.fileSize } });
  if (doc.folder) {
    await Folder.findByIdAndUpdate(doc.folder, { $inc: { storageUsed: doc.fileSize, totalItems: 1 } });
  }
});

FileSchema.post("findOneAndDelete", async function (doc: any) {
  if (doc) {
    await User.findByIdAndUpdate(doc.owner, { $inc: { usedStorage: -doc.fileSize } });
    if (doc.folder) {
      await Folder.findByIdAndUpdate(doc.folder, { $inc: { storageUsed: -doc.fileSize, totalItems: -1 } });
    }
  }
});

// Indexes
FileSchema.index({ owner: 1 });
FileSchema.index({ type: 1 });
FileSchema.index({ folder: 1 });
FileSchema.index({ createdAt: -1 });

// Full-text index for search
FileSchema.index({ title: "text", filename: "text", tags: "text" });

export default mongoose.models.File || mongoose.model<IFile>("File", FileSchema);
