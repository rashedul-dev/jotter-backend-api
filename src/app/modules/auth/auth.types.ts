import { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  pinCode?: string;
  profileImage?: string;
  storageLimit: number;
  usedStorage: number;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFolder extends Document {
  name: string;
  owner: Schema.Types.ObjectId;
  parentFolder?: Schema.Types.ObjectId;
  isPrivate: boolean;
  totalItems: number;
  storageUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFile extends Document {
  type: 'note' | 'image' | 'pdf';
  title: string;
  filename?: string;
  filePath?: string;
  fileSize: number;
  owner: Schema.Types.ObjectId;
  folder?: Schema.Types.ObjectId;
  isFavorite: boolean;
  tags: string[];
  metadata: any;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  type: 'password_reset' | 'email_verify';
  expiresAt: Date;
  createdAt: Date;
}

export interface IActivity extends Document {
  user: Schema.Types.ObjectId;
  action: 'created' | 'updated' | 'deleted' | 'viewed';
  resourceType: 'folder' | 'note' | 'image' | 'pdf';
  resourceId: Schema.Types.ObjectId;
  resourceTitle: string;
  timestamp: Date;
}
