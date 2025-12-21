import { Document, Types } from 'mongoose';

export interface ISettings {
  notifications: {
    emailSummary: boolean;
    storageAlerts: boolean;
    securityAlerts: boolean;
  };
  privacy: {
    defaultPrivate: boolean;
    hideFileSizes: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    itemsPerPage: number;
  };
}

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
  settings: ISettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFolder extends Document {
  name: string;
  owner: Types.ObjectId;
  parentFolder?: Types.ObjectId;
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
  owner: Types.ObjectId;
  folder?: Types.ObjectId;
  isFavorite: boolean;
  tags: string[];
  metadata?: any;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity extends Document {
  user: Types.ObjectId;
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'favorited' | 'moved';
  resourceType: 'folder' | 'note' | 'image' | 'pdf';
  resourceId: Types.ObjectId;
  resourceTitle: string;
  timestamp: Date;
}

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  type: 'email_verify' | 'password_reset';
  expiresAt: Date;
  createdAt: Date;
}
