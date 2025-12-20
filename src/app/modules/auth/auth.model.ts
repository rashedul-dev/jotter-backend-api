import mongoose, { Schema } from 'mongoose';
import { IUser } from '../../interfaces/models';

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    pinCode: {
      type: String,
      select: false,
    },
    profileImage: {
      type: String,
    },
    storageLimit: {
      type: Number,
      default: 15728640000, // 15GB in bytes
    },
    usedStorage: {
      type: Number,
      default: 0,
    },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      settings: {
        notifications: {
          emailSummary: { type: Boolean, default: true },
          storageAlerts: { type: Boolean, default: true },
          securityAlerts: { type: Boolean, default: true },
        },
        privacy: {
          defaultPrivate: { type: Boolean, default: false },
          hideFileSizes: { type: Boolean, default: false },
        },
        display: {
          theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
          itemsPerPage: { type: Number, min: 10, max: 100, default: 20 },
        },
      },
      verificationCode: String,

    verificationExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
