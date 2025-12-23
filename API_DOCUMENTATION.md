# Jotter Backend API Documentation

**Base URL:** `http://localhost:5000/api/v1`

**Version:** 1.0.0

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [PIN System](#pin-system)
- [File Management](#file-management)
- [Folder Management](#folder-management)
- [Storage Management](#storage-management)
- [Search](#search)
- [Calendar](#calendar)
- [Activity](#activity)
- [Support](#support)
- [Error Responses](#error-responses)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### 1. Register User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Rashedul Islam",
  "email": "rashedulislam.edge@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "65abc123def456789",
      "name": "Rashedul Islam",
      "email": "rashedulislam.edge@example.com",
      "isEmailVerified": false,
      "storageUsed": 0,
      "storageLimit": 104857600
    }
  }
}
```

**Validation Rules:**

- name: required, min 2 characters
- email: required, valid email format
- password: required, min 8 characters, must contain uppercase, lowercase, number, and special character

---

### 2. Verify Email

**Endpoint:** `POST /auth/verify-email`

**Description:** Verify email address with verification code

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "rashedulislam.edge@example.com",
  "code": "123456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65abc123def456789",
      "name": "Rashedul Islam",
      "email": "rashedulislam.edge@example.com",
      "isEmailVerified": true
    }
  }
}
```

---

### 3. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "rashedulislam.edge@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65abc123def456789",
      "name": "Rashedul Islam",
      "email": "rashedulislam.edge@example.com",
      "profileImage": null,
      "isEmailVerified": true,
      "storageUsed": 1048576,
      "storageLimit": 104857600
    }
  }
}
```

---

### 4. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request password reset code via email

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "rashedulislam.edge@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset code sent to your email"
}
```

---

### 5. Verify Reset Code

**Endpoint:** `POST /auth/verify-reset-code`

**Description:** Verify the password reset code

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "rashedulislam.edge@example.com",
  "code": "654321"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reset code verified successfully"
}
```

---

### 6. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password with verified code

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "rashedulislam.edge@example.com",
  "code": "654321",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 7. Resend Verification Code

**Endpoint:** `POST /auth/resend-verification`

**Description:** Resend email verification code

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "rashedulislam.edge@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

---

## User Management

All user endpoints require authentication.

### 1. Get Current User

**Endpoint:** `GET /users/me`

**Description:** Get current authenticated user details

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "name": "Rashedul Islam",
    "email": "rashedulislam.edge@example.com",
    "profileImage": "https://example.com/uploads/profile.jpg",
    "isEmailVerified": true,
    "storageUsed": 2097152,
    "storageLimit": 104857600,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Get User Profile

**Endpoint:** `GET /users/profile`

**Description:** Get detailed user profile

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "name": "Rashedul Islam",
    "email": "rashedulislam.edge@example.com",
    "profileImage": "https://example.com/uploads/profile.jpg",
    "bio": "Software Developer",
    "phone": "+1234567890",
    "location": "New York, USA",
    "website": "https://johndoe.com",
    "settings": {
      "language": "en",
      "timezone": "America/New_York",
      "emailNotifications": true,
      "pushNotifications": true,
      "theme": "light"
    },
    "storageUsed": 2097152,
    "storageLimit": 104857600
  }
}
```

---

### 3. Update Profile

**Endpoint:** `PUT /users/profile`

**Description:** Update user profile information

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Rashedul Islam Updated",
  "bio": "Senior Software Developer",
  "phone": "+1234567890",
  "location": "San Francisco, USA",
  "website": "https://johndoe.dev"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "65abc123def456789",
    "name": "Rashedul Islam Updated",
    "email": "rashedulislam.edge@example.com",
    "bio": "Senior Software Developer",
    "phone": "+1234567890",
    "location": "San Francisco, USA",
    "website": "https://johndoe.dev"
  }
}
```

---

### 4. Upload Profile Image

**Endpoint:** `POST /users/profile/image`

**Description:** Upload or update profile picture

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**

```
image: <file> (JPEG, PNG, max 5MB)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "profileImage": "https://example.com/uploads/profile-65abc123.jpg"
  }
}
```

---

### 5. Remove Profile Image

**Endpoint:** `DELETE /users/profile/image`

**Description:** Remove current profile picture

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile image removed successfully"
}
```

---

### 6. Get User Settings

**Endpoint:** `GET /users/settings`

**Description:** Get user preferences and settings

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "language": "en",
    "timezone": "America/New_York",
    "emailNotifications": true,
    "pushNotifications": true,
    "theme": "dark"
  }
}
```

---

### 7. Update Settings

**Endpoint:** `PUT /users/settings`

**Description:** Update user preferences

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "language": "es",
  "timezone": "Europe/Madrid",
  "emailNotifications": false,
  "pushNotifications": true,
  "theme": "dark"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "language": "es",
    "timezone": "Europe/Madrid",
    "emailNotifications": false,
    "pushNotifications": true,
    "theme": "dark"
  }
}
```

---

### 8. Get User Stats

**Endpoint:** `GET /users/stats`

**Description:** Get user statistics (files, folders, storage)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalFiles": 45,
    "totalFolders": 12,
    "totalImages": 23,
    "totalPdfs": 15,
    "totalNotes": 7,
    "storageUsed": 52428800,
    "storageLimit": 104857600,
    "storagePercentage": 50,
    "favoriteFiles": 8,
    "recentActivity": 127
  }
}
```

---

### 9. Delete Account

**Endpoint:** `DELETE /users/account`

**Description:** Permanently delete user account and all associated data

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## PIN System

PIN system for protecting private folders and files.

### 1. Set PIN

**Endpoint:** `POST /pin/set`

**Description:** Set a new 4-digit PIN

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "pin": "1234"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "PIN set successfully"
}
```

**Validation:**

- PIN must be exactly 4 digits
- Only numbers allowed

---

### 2. Verify PIN

**Endpoint:** `POST /pin/verify`

**Description:** Verify PIN before accessing private content

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "pin": "1234"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "PIN verified successfully",
  "data": {
    "verified": true,
    "expiresAt": "2024-01-15T11:30:00.000Z"
  }
}
```

---

### 3. Get PIN Status

**Endpoint:** `GET /pin/status`

**Description:** Check if user has PIN set and if it's currently verified

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "hasPin": true,
    "isVerified": false,
    "verifiedUntil": null
  }
}
```

---

### 4. Remove PIN

**Endpoint:** `DELETE /pin/remove`

**Description:** Remove PIN (requires current PIN verification)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "pin": "1234"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "PIN removed successfully. All private folders are now public."
}
```

---

## File Management

### 1. Upload Image

**Endpoint:** `POST /files/upload/image`

**Description:** Upload an image file (JPG, PNG, GIF, WebP)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**

```
file: <image_file> (max 10MB)
folderId: "65abc123def456789" (optional)
tags: ["work", "design"] (optional, comma-separated)
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "_id": "65def456ghi789012",
    "type": "image",
    "name": "screenshot.png",
    "size": 245760,
    "url": "https://example.com/uploads/screenshot-65def456.png",
    "thumbnail": "https://example.com/uploads/thumbnail-screenshot-65def456.png",
    "mimeType": "image/png",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "png"
    },
    "tags": ["work", "design"],
    "isFavorite": false,
    "folderId": "65abc123def456789",
    "userId": "65abc123def456789",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Upload PDF

**Endpoint:** `POST /files/upload/pdf`

**Description:** Upload a PDF file

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**

```
file: <pdf_file> (max 20MB)
folderId: "65abc123def456789" (optional)
tags: ["document", "report"] (optional)
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "PDF uploaded successfully",
  "data": {
    "_id": "65ghi789jkl012345",
    "type": "pdf",
    "name": "report.pdf",
    "size": 1048576,
    "url": "https://example.com/uploads/report-65ghi789.pdf",
    "mimeType": "application/pdf",
    "metadata": {
      "pages": 15
    },
    "tags": ["document", "report"],
    "isFavorite": false,
    "folderId": "65abc123def456789",
    "userId": "65abc123def456789",
    "createdAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

### 3. Create Note

**Endpoint:** `POST /files/note`

**Description:** Create a text note

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Meeting Notes",
  "content": "Important discussion points from today's meeting...",
  "folderId": "65abc123def456789",
  "tags": ["meeting", "work"]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "_id": "65jkl012mno345678",
    "type": "note",
    "name": "Meeting Notes",
    "size": 512,
    "noteContent": "Important discussion points from today's meeting...",
    "tags": ["meeting", "work"],
    "isFavorite": false,
    "folderId": "65abc123def456789",
    "userId": "65abc123def456789",
    "createdAt": "2024-01-15T10:40:00.000Z"
  }
}
```

---

### 4. Get All Files

**Endpoint:** `GET /files`

**Description:** Get all user files with filtering and pagination

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

```
type: image | pdf | note (optional)
folderId: string (optional, use "root" for root level files)
page: number (default: 1)
limit: number (default: 20, max: 100)
sortBy: createdAt | name | size (default: createdAt)
sortOrder: asc | desc (default: desc)
```

**Example:** `GET /files?type=image&page=1&limit=10&sortBy=name&sortOrder=asc`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "_id": "65def456ghi789012",
        "type": "image",
        "name": "photo.jpg",
        "size": 245760,
        "url": "https://example.com/uploads/photo.jpg",
        "thumbnail": "https://example.com/uploads/thumb-photo.jpg",
        "tags": ["vacation"],
        "isFavorite": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 5. Get File Details

**Endpoint:** `GET /files/:id`

**Description:** Get detailed information about a specific file

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "65def456ghi789012",
    "type": "image",
    "name": "screenshot.png",
    "size": 245760,
    "url": "https://example.com/uploads/screenshot.png",
    "thumbnail": "https://example.com/uploads/thumb-screenshot.png",
    "mimeType": "image/png",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "png"
    },
    "tags": ["work", "design"],
    "isFavorite": false,
    "folderId": "65abc123def456789",
    "folder": {
      "_id": "65abc123def456789",
      "name": "Work Documents",
      "isPrivate": false
    },
    "userId": "65abc123def456789",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 6. Download File

**Endpoint:** `GET /files/:id/download`

**Description:** Download a file (returns file stream)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
Returns the file with appropriate headers for download.

---

### 7. Update File

**Endpoint:** `PUT /files/:id`

**Description:** Update file metadata (name, tags, folder)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Updated Screenshot",
  "tags": ["work", "design", "ui"],
  "folderId": "65new123folder456",
  "noteContent": "Updated note content (for notes only)"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "File updated successfully",
  "data": {
    "_id": "65def456ghi789012",
    "type": "image",
    "name": "Updated Screenshot",
    "tags": ["work", "design", "ui"],
    "folderId": "65new123folder456",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### 8. Delete File

**Endpoint:** `DELETE /files/:id`

**Description:** Delete a file permanently

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### 9. Toggle Favorite

**Endpoint:** `PATCH /files/:id/favorite`

**Description:** Add or remove file from favorites

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "File added to favorites",
  "data": {
    "isFavorite": true
  }
}
```

---

### 10. Toggle Private

**Endpoint:** `PATCH /files/:id/private`

**Description:** Toggle file privacy status. Requires PIN verification if the file or its parent folder is private.

**Headers:**

```
Authorization: Bearer <your_jwt_token>
X-PIN: 1234 (required if file or folder is private)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "File privacy updated successfully",
  "data": {
    "isPrivate": true
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "PIN required to access private file"
}
```

---

## Folder Management

### 1. Create Folder

**Endpoint:** `POST /folders`

**Description:** Create a new folder

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Work Documents",
  "isPrivate": false,
  "parentId": null
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "_id": "65abc123def456789",
    "name": "Work Documents",
    "isPrivate": false,
    "parentId": null,
    "userId": "65abc123def456789",
    "fileCount": 0,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 2. Get All Folders

**Endpoint:** `GET /folders`

**Description:** Get user's folder hierarchy

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

```
parentId: string (optional, null for root folders)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456789",
      "name": "Work Documents",
      "isPrivate": false,
      "parentId": null,
      "fileCount": 12,
      "subfolderCount": 3,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "_id": "65private789folder",
      "name": "Private Files",
      "isPrivate": true,
      "parentId": null,
      "fileCount": 5,
      "subfolderCount": 0,
      "createdAt": "2024-01-15T09:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Folder Details

**Endpoint:** `GET /folders/:id`

**Description:** Get folder details with contents (requires PIN for private folders)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
X-PIN: 1234 (required if folder is private)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "folder": {
      "_id": "65abc123def456789",
      "name": "Work Documents",
      "isPrivate": false,
      "parentId": null,
      "userId": "65abc123def456789",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "breadcrumb": [
      {
        "_id": null,
        "name": "Root"
      },
      {
        "_id": "65abc123def456789",
        "name": "Work Documents"
      }
    ],
    "files": [
      {
        "_id": "65file123abc",
        "type": "image",
        "name": "logo.png",
        "size": 102400,
        "url": "https://example.com/uploads/logo.png",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "subfolders": [
      {
        "_id": "65subfolder456",
        "name": "Reports",
        "fileCount": 8,
        "isPrivate": false
      }
    ],
    "stats": {
      "totalFiles": 12,
      "totalSubfolders": 3,
      "totalSize": 5242880
    }
  }
}
```

---

### 4. Update Folder

**Endpoint:** `PUT /folders/:id`

**Description:** Update folder name or privacy (requires PIN if private)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
X-PIN: 1234 (required if folder is private)
```

**Request Body:**

```json
{
  "name": "Updated Folder Name",
  "isPrivate": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Folder updated successfully",
  "data": {
    "_id": "65abc123def456789",
    "name": "Updated Folder Name",
    "isPrivate": true,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### 5. Delete Folder

**Endpoint:** `DELETE /folders/:id`

**Description:** Delete folder and optionally its contents (requires PIN if private)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
X-PIN: 1234 (required if folder is private)
```

**Query Parameters:**

```
deleteFiles: true | false (default: false)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Folder and 12 files deleted successfully"
}
```

---

### 6. Move Folder

**Endpoint:** `PATCH /folders/:id/move`

**Description:** Move folder to another parent folder

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "newParentId": "65new123parent456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Folder moved successfully",
  "data": {
    "_id": "65abc123def456789",
    "name": "Work Documents",
    "parentId": "65new123parent456"
  }
}
```

---

### 7. Toggle Favorite

**Endpoint:** `PATCH /folders/:id/favorite`

**Description:** Add or remove folder from favorites

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Folder added to favorites",
  "data": {
    "isFavorite": true
  }
}
```

---

### 8. Toggle Private

**Endpoint:** `PATCH /folders/:id/private`

**Description:** Toggle folder privacy status. When a folder is marked private, all its contents require PIN verification to access. Requires PIN verification if folder is currently private.

**Headers:**

```
Authorization: Bearer <your_jwt_token>
X-PIN: 1234 (required if folder is currently private)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Folder privacy updated successfully",
  "data": {
    "isPrivate": true
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "PIN required to access private folder"
}
```

**Note:** When a folder is marked as private, all files and subfolders within it become private and require PIN verification.

---

## Storage Management

### 1. Get Storage Statistics

**Endpoint:** `GET /storage`

**Description:** Get detailed storage usage breakdown

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "storageUsed": 52428800,
    "storageLimit": 104857600,
    "storagePercentage": 50,
    "storageUsedMB": 50,
    "storageLimitMB": 100,
    "availableStorage": 52428800,
    "availableStorageMB": 50,
    "breakdown": {
      "images": {
        "count": 23,
        "size": 31457280,
        "sizeMB": 30
      },
      "pdfs": {
        "count": 15,
        "size": 20971520,
        "sizeMB": 20
      },
      "notes": {
        "count": 7,
        "size": 0,
        "sizeMB": 0
      }
    },
    "warning": null
  }
}
```

**Storage Warnings:**

- At 80%: "You are using 80% of your storage. Consider deleting unused files."
- At 90%: "You are using 90% of your storage. Please free up some space."
- At 95%: "You are using 95% of your storage. Upload may fail soon."

---

### 2. Check Storage Before Upload

**Endpoint:** `POST /storage/check`

**Description:** Check if file can be uploaded without exceeding limit

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "fileSize": 5242880
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "canUpload": true,
    "storageUsed": 52428800,
    "storageLimit": 104857600,
    "availableStorage": 52428800,
    "fileSize": 5242880,
    "storageAfterUpload": 57671680,
    "percentageAfterUpload": 55
  }
}
```

**Insufficient Storage (400):**

```json
{
  "success": false,
  "message": "Insufficient storage space. File size: 55 MB, Available: 50 MB"
}
```

---

## Search

### 1. Global Search

**Endpoint:** `GET /search`

**Description:** Search across files and folders

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

```
q: string (required, min 2 characters)
type: all | file | folder (default: all)
page: number (default: 1)
limit: number (default: 20, max: 100)
```

**Example:** `GET /search?q=report&type=file&page=1&limit=10`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "65file123abc",
        "type": "file",
        "fileType": "pdf",
        "name": "Annual Report 2024",
        "size": 1048576,
        "url": "https://example.com/uploads/report.pdf",
        "tags": ["business", "report"],
        "folderId": "65folder456",
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      {
        "_id": "65folder789xyz",
        "type": "folder",
        "name": "Reports",
        "isPrivate": false,
        "fileCount": 15,
        "createdAt": "2024-01-10T08:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

### 2. Search by Tag

**Endpoint:** `GET /search/tag/:tag`

**Description:** Find all files with a specific tag

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

```
page: number (default: 1)
limit: number (default: 20)
```

**Example:** `GET /search/tag/work?page=1&limit=10`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "tag": "work",
    "files": [
      {
        "_id": "65file123abc",
        "type": "image",
        "name": "presentation.png",
        "size": 512000,
        "url": "https://example.com/uploads/presentation.png",
        "tags": ["work", "meeting"],
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

## Calendar

### 1. Get Calendar Data

**Endpoint:** `GET /calendar`

**Description:** Get activity calendar for a month. By default, activities from private files/folders are excluded.

**Headers:**

```
Authorization: Bearer <your_jwt_token>
X-PIN: 1234 (required if includePrivate=true)
```

**Query Parameters:**

```
year: number (default: current year)
month: number (default: current month, 1-12)
includePrivate: true | false (default: false, requires PIN in header)
```

**Example:** `GET /calendar?year=2024&month=1&includePrivate=true`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "days": [
      {
        "date": "2024-01-15",
        "activityCount": 8,
        "hasActivity": true
      },
      {
        "date": "2024-01-16",
        "activityCount": 3,
        "hasActivity": true
      },
      {
        "date": "2024-01-17",
        "activityCount": 0,
        "hasActivity": false
      }
    ],
    "totalActivities": 127
  }
}
```

**Error Response (403) - When includePrivate=true without PIN:**

```json
{
  "success": false,
  "message": "PIN required to include private activities"
}
```

---

### 2. Get Day Activities

**Endpoint:** `GET /calendar/:date`

**Description:** Get all activities for a specific date. By default, activities from private files/folders are excluded.

**Headers:**

```
Authorization: Bearer <your_jwt_token>
X-PIN: 1234 (required if includePrivate=true)
```

**Query Parameters:**

```
includePrivate: true | false (default: false, requires PIN in header)
```

**Example:** `GET /calendar/2024-01-15?includePrivate=true`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "activities": [
      {
        "_id": "65activity123",
        "userId": "65user789",
        "type": "file_upload",
        "description": "Uploaded PDF 'report.pdf'",
        "metadata": {
          "fileId": "65file456",
          "fileName": "report.pdf",
          "fileType": "pdf",
          "fileSize": 1048576
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalCount": 8
  }
}
```

**Error Response (403) - When includePrivate=true without PIN:**

```json
{
  "success": false,
  "message": "PIN required to include private activities"
}
```

**Note:** Private activities are those associated with files or folders marked as private. To view them in the calendar, you must provide the correct PIN in the X-PIN header and set includePrivate=true.

---

## Activity

### 1. Get Activities

**Endpoint:** `GET /activity`

**Description:** Get user activity log with pagination

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

```
page: number (default: 1)
limit: number (default: 50, max: 100)
type: string (optional filter: file_upload, file_delete, folder_create, etc.)
```

**Example:** `GET /activity?page=1&limit=20&type=file_upload`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "65activity123",
        "userId": "65user789",
        "type": "file_upload",
        "description": "Uploaded PDF 'report.pdf'",
        "metadata": {
          "fileId": "65file456",
          "fileName": "report.pdf",
          "fileType": "pdf",
          "fileSize": 1048576
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 127,
      "page": 1,
      "limit": 20,
      "totalPages": 7
    }
  }
}
```

**Activity Types:**

- `file_upload` - File uploaded
- `file_update` - File updated
- `file_delete` - File deleted
- `folder_create` - Folder created
- `folder_update` - Folder updated
- `folder_delete` - Folder deleted
- `pin_set` - PIN created
- `pin_remove` - PIN removed
- `profile_update` - Profile updated

---

### 2. Get Recent Activity

**Endpoint:** `GET /activity/recent`

**Description:** Get last 10 recent activities

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65activity123",
      "type": "file_upload",
      "description": "Uploaded image 'photo.jpg'",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Clear Old Activities

**Endpoint:** `DELETE /activity/clear`

**Description:** Delete activities older than 30 days

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

```
days: number (default: 30)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Deleted 45 old activities"
}
```

---

## Support

### 1. Get Contact Information

**Endpoint:** `GET /support/contact`

**Description:** Get app contact information (public endpoint)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "email": "support@jotterapp.com",
    "phone": "+1-800-JOTTER",
    "address": "123 Jotter Street, San Francisco, CA 94102",
    "socialMedia": {
      "twitter": "@jotterapp",
      "facebook": "JotterApp",
      "instagram": "@jotter"
    }
  }
}
```

---

### 2. Get FAQs

**Endpoint:** `GET /support/faq`

**Description:** Get frequently asked questions (public endpoint)

**Query Parameters:**

```
category: string (optional)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65faq123",
      "question": "How do I upload files?",
      "answer": "To upload files, navigate to the Files section and click the Upload button. Select your file and choose a destination folder.",
      "category": "files",
      "order": 1
    },
    {
      "_id": "65faq456",
      "question": "What is the storage limit?",
      "answer": "Free accounts get 100MB of storage. Premium accounts get 10GB.",
      "category": "storage",
      "order": 2
    }
  ]
}
```

---

### 3. Create Support Request

**Endpoint:** `POST /support/request`

**Description:** Submit a support request with optional attachments

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**

```
subject: string (required)
message: string (required, min 20 characters)
category: string (required: technical, billing, feature, other)
attachments: files[] (optional, max 5 files, 5MB each)
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Support request submitted successfully. We'll respond within 24 hours.",
  "data": {
    "_id": "65support123",
    "ticketNumber": "TICK-2024-0015",
    "userId": "65user789",
    "subject": "Unable to upload large files",
    "message": "I'm getting an error when trying to upload files larger than 5MB...",
    "category": "technical",
    "status": "open",
    "attachments": [
      {
        "filename": "error-screenshot.png",
        "url": "https://example.com/support/error-screenshot.png",
        "size": 245760
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Get User Support Requests

**Endpoint:** `GET /support/requests`

**Description:** Get all support requests by current user

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

```
status: open | in_progress | resolved | closed (optional)
page: number (default: 1)
limit: number (default: 10)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "65support123",
        "ticketNumber": "TICK-2024-0015",
        "subject": "Unable to upload large files",
        "category": "technical",
        "status": "in_progress",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T14:20:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 5. Get Support Request Details

**Endpoint:** `GET /support/requests/:id`

**Description:** Get detailed information about a support request

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "65support123",
    "ticketNumber": "TICK-2024-0015",
    "userId": "65user789",
    "subject": "Unable to upload large files",
    "message": "I'm getting an error when trying to upload files larger than 5MB...",
    "category": "technical",
    "status": "in_progress",
    "attachments": [
      {
        "filename": "error-screenshot.png",
        "url": "https://example.com/support/error-screenshot.png",
        "size": 245760
      }
    ],
    "responses": [
      {
        "message": "We're looking into this issue. Can you provide your browser version?",
        "respondedBy": "Support Team",
        "respondedAt": "2024-01-15T14:20:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z"
  }
}
```

---

## Error Responses

The API uses consistent error response formats:

### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Authentication Error (401)

```json
{
  "success": false,
  "message": "Please authenticate to access this resource"
}
```

### Authorization Error (403)

```json
{
  "success": false,
  "message": "You don't have permission to access this resource"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "File not found"
}
```

### Storage Limit Error (400)

```json
{
  "success": false,
  "message": "Storage limit exceeded. Cannot upload file."
}
```

### Rate Limit Error (429)

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "An error occurred while processing your request"
}
```

---

## Postman Collection Setup

### Environment Variables

Create a Postman environment with these variables:

```
baseUrl: http://localhost:5000/api/v1
token: <your_jwt_token_after_login>
userId: <your_user_id>
fileId: <test_file_id>
folderId: <test_folder_id>
pin: 1234
```

### Pre-request Script (for authenticated requests)

Add this to your collection or folder:

```javascript
pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.environment.get("token"),
});
```

### Test Script (save token after login)

Add this to your login request:

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("token", response.data.token);
  pm.environment.set("userId", response.data.user._id);
}
```

---

## Testing Workflow

1. **Register** → Save user details
2. **Verify Email** → Use code from email/logs → Save token
3. **Login** → Save token
4. **Set PIN** → Set 4-digit PIN
5. **Create Folder** → Save folderId
6. **Upload File** → Save fileId
7. **Test other endpoints** with saved IDs

---

## Rate Limits

- **Auth endpoints:** 5 requests per 15 minutes per IP
- **Email endpoints:** 3 requests per hour per IP
- **PIN endpoints:** 5 requests per 15 minutes per user
- **Upload endpoints:** Storage limit checked before each upload

---

## File Size Limits

- **Images:** 10 MB
- **PDFs:** 20 MB
- **Profile Images:** 5 MB
- **Support Attachments:** 5 MB each (max 5 files)

---

## Supported File Types

### Images

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Documents

- PDF (.pdf)

### Notes

- Plain text (stored in database)

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. File sizes are in bytes
3. Storage limits are enforced server-side
4. Private folders require PIN verification via `X-PIN` header
5. Activity logging is automatic for all file/folder operations
6. Search is case-insensitive and supports partial matches

---

**Last Updated:** January 2024  
**API Version:** 1.0.0
