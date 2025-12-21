import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const user: any = (req as any).user;
    const userId = user ? user._id : 'anonymous';
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    let subDir = 'others';
    if (file.mimetype.startsWith('image/')) subDir = 'images';
    else if (file.mimetype === 'application/pdf') subDir = 'pdfs';

    const uploadPath = path.join('uploads', 'users', userId.toString(), subDir, year, month);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedPdfTypes = /pdf/;
  
  const mimetype = file.mimetype;
  const extname = path.extname(file.originalname).toLowerCase();

  const isImage = allowedImageTypes.test(mimetype) || allowedImageTypes.test(extname);
  const isPdf = allowedPdfTypes.test(mimetype) || allowedPdfTypes.test(extname);

  if (isImage || isPdf) {
    return cb(null, true);
  }
  cb(new Error('Only images and PDFs are allowed'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (PDF limit)
  fileFilter,
});
