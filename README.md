# Jotter Backend API

A robust and scalable RESTful API for the Jotter application - a comprehensive file management system with support for images, PDFs, notes, folders, and private content protection.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality

- **User Authentication** - Secure JWT-based authentication with email verification
- **File Management** - Upload, organize, and manage images, PDFs, and text notes
- **Folder System** - Hierarchical folder structure with nested folders support
- **Private Content Protection** - PIN-based security for sensitive files and folders
- **Search & Filter** - Advanced search capabilities with tag-based filtering
- **Calendar View** - Timeline-based content organization and retrieval
- **Activity Tracking** - Comprehensive audit log of user actions
- **Storage Management** - Real-time storage quota monitoring and enforcement

### Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- PIN protection for private content
- Email verification system
- Rate limiting on sensitive endpoints
- File type validation and size restrictions
- CORS protection

### File Operations

- Image upload with automatic thumbnail generation (JPEG, PNG, GIF, WebP)
- PDF upload with metadata extraction
- Text note creation and editing
- Bulk file operations (move, delete, favorite)
- File preview and download

## Tech Stack

### Backend Framework

- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v5) - Web application framework
- **TypeScript** - Static type checking

### Database

- **MongoDB** (v9) - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security

- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **cors** - Cross-origin resource sharing

### File Processing

- **Multer** - File upload middleware
- **Sharp** - Image processing and thumbnail generation
- **pdf-parse** - PDF metadata extraction

### Email

- **Nodemailer** - Email sending for verification codes

### Development Tools

- **ts-node-dev** - TypeScript development server with hot reload
- **ESLint** - Code linting and quality

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher) or **yarn**
- **MongoDB** (v6.x or higher) - Local installation or cloud instance (MongoDB Atlas)
- **Git** - Version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/jotter-backend-api.git
cd jotter-backend-api
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration (see [Environment Variables](#environment-variables) section).

### 4. Create Upload Directory

```bash
mkdir uploads
```

## Environment Variables

Configure the following environment variables in your `.env` file:

### Server Configuration

```env
PORT=5000
NODE_ENV=development
```

- **PORT** - Server port (default: 5000)
- **NODE_ENV** - Environment mode (`development`, `production`, `test`)

### Database Configuration

```env
MONGODB_URI=mongodb://localhost:27017/jotter
```

- **MONGODB_URI** - MongoDB connection string
  - Local: `mongodb://localhost:27017/jotter`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/jotter`

### JWT Configuration

```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

- **JWT_SECRET** - Secret key for signing JWT tokens (use a strong random string in production)
- **JWT_EXPIRE** - Token expiration time (e.g., `7d`, `24h`, `30m`)

### SMTP Configuration (Email)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

- **SMTP_HOST** - SMTP server hostname
- **SMTP_PORT** - SMTP port (587 for TLS, 465 for SSL)
- **SMTP_USER** - Email account for sending emails
- **SMTP_PASS** - Email password or app-specific password

> **Note:** For Gmail, you need to enable 2FA and create an App Password

### Storage Configuration

```env
UPLOAD_PATH=./uploads
MAX_IMAGE_SIZE=10485760
MAX_PDF_SIZE=52428800
```

- **UPLOAD_PATH** - Directory path for file uploads
- **MAX_IMAGE_SIZE** - Maximum image file size in bytes (default: 10MB)
- **MAX_PDF_SIZE** - Maximum PDF file size in bytes (default: 50MB)

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

- **RATE_LIMIT_WINDOW_MS** - Rate limit window in milliseconds (default: 15 minutes)
- **RATE_LIMIT_MAX_REQUESTS** - Maximum requests per window (default: 100)

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
# or
yarn dev
```

The server will start at `http://localhost:5000` (or your configured PORT).

### Production Mode

#### 1. Build the TypeScript code:

```bash
npm run build
# or
yarn build
```

#### 2. Start the production server:

```bash
npm start
# or
yarn start
```

## API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints Overview

| Module       | Endpoints            | Description                                             |
| ------------ | -------------------- | ------------------------------------------------------- |
| **Auth**     | `/api/v1/auth/*`     | Registration, login, email verification, password reset |
| **Users**    | `/api/v1/users/*`    | User profile, settings, statistics                      |
| **PIN**      | `/api/v1/pin/*`      | Set, verify, and manage PIN for private content         |
| **Files**    | `/api/v1/files/*`    | Upload, retrieve, update, delete files                  |
| **Folders**  | `/api/v1/folders/*`  | Create, organize, manage folders                        |
| **Storage**  | `/api/v1/storage/*`  | Storage usage and quota management                      |
| **Search**   | `/api/v1/search/*`   | Search files and folders                                |
| **Calendar** | `/api/v1/calendar/*` | Date-based content retrieval                            |
| **Activity** | `/api/v1/activity/*` | User activity logs                                      |
| **Support**  | `/api/v1/support/*`  | Support requests                                        |

### Detailed Documentation

For complete API documentation with request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Postman Collection

Import the Postman collection for easy API testing:

1. Open Postman
2. Click **Import**
3. Select `postman_collection.json` from the project root
4. Configure environment variables (base URL, token, etc.)

## Project Structure

```
jotter-backend-api/
├── src/
│   ├── app/
│   │   ├── config/              # Configuration files
│   │   │   ├── db.ts           # Database connection
│   │   │   └── nodemailer.ts   # Email configuration
│   │   ├── interfaces/          # TypeScript interfaces
│   │   │   └── models.ts       # Model interfaces
│   │   ├── middlewares/         # Express middlewares
│   │   │   └── error.middleware.ts
│   │   ├── models/              # Mongoose models (deprecated)
│   │   ├── modules/             # Feature modules
│   │   │   ├── activity/       # Activity tracking
│   │   │   ├── auth/           # Authentication
│   │   │   ├── calendar/       # Calendar views
│   │   │   ├── files/          # File management
│   │   │   ├── folders/        # Folder management
│   │   │   ├── pin/            # PIN system
│   │   │   ├── search/         # Search functionality
│   │   │   ├── storage/        # Storage management
│   │   │   ├── support/        # Support system
│   │   │   └── user/           # User management
│   │   └── utils/              # Utility functions
│   │       ├── asyncHandler.ts
│   │       ├── emailService.ts
│   │       └── fileUpload.ts
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── uploads/                     # File upload directory
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── eslint.config.js            # ESLint configuration
├── API_DOCUMENTATION.md        # API documentation
├── BACKEND_AUDIT_SUMMARY.md    # Security audit summary
└── README.md                   # This file
```

### Module Structure

Each feature module follows this pattern:

```
module/
├── module.model.ts       # Mongoose schema
├── module.interface.ts   # TypeScript interfaces
├── module.controller.ts  # Request handlers
├── module.service.ts     # Business logic
├── module.route.ts       # Route definitions
├── module.validation.ts  # Input validation (optional)
└── module.middleware.ts  # Module-specific middleware (optional)
```

## Security Features

### Authentication & Authorization

- JWT-based stateless authentication
- Secure password hashing with bcrypt (10 rounds)
- Email verification required for new accounts
- Password reset with time-limited verification codes

### PIN Protection

- 4-digit PIN for private folders and files
- PIN verification required for accessing private content
- Encrypted PIN storage
- Time-limited PIN sessions

### Input Validation

- Request body validation using custom validators
- File type and size restrictions
- SQL injection prevention via Mongoose
- XSS protection through input sanitization

### Rate Limiting

- Configurable rate limiting on all endpoints
- Stricter limits on authentication endpoints
- IP-based request tracking

### File Security

- MIME type validation
- File size limits enforced
- Secure file storage with unique identifiers
- Automatic thumbnail generation for images

## Testing

### Manual Testing with Postman

1. Import `postman_collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api/v1`
   - `token`: Your JWT token after login
3. Test endpoints in sequence (register → verify → login)

### Testing Checklist

- [ ] User registration and email verification
- [ ] Login and JWT token generation
- [ ] Password reset flow
- [ ] File upload (images, PDFs)
- [ ] Note creation and editing
- [ ] Folder creation and nesting
- [ ] PIN set and verification
- [ ] Private folder access control
- [ ] Search functionality
- [ ] Calendar date filtering
- [ ] Storage quota enforcement

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/rashedul-dev/jotter-backend-api/issues)
- **Email**: rashedulislam.edge@gmail.com
- **Documentation**: [API Documentation](./API_DOCUMENTATION.md)

## Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the powerful database
- All contributors who have helped improve this project

---

**Built with ❤️ using Node.js, TypeScript, and Express.js**
