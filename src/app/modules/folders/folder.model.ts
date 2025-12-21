import mongoose, { Schema } from 'mongoose';
import { IFolder } from '../../interfaces/models';
import File from '../files/file.model';

const FolderSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a folder name'],
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentFolder: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Cascading delete
FolderSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    // Delete all files in this folder
    await File.deleteMany({ folder: doc._id });
    // Recursively delete subfolders
    const subfolders = await this.model.find({ parentFolder: doc._id });
    for (const sub of subfolders) {
      await mongoose.model('Folder').findByIdAndDelete(sub._id);
    }
  }
  next();
});

// Indexes
FolderSchema.index({ owner: 1 });
FolderSchema.index({ parentFolder: 1 });
FolderSchema.index({ name: 'text' });

export default mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);
