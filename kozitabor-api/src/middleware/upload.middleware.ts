import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ellenőrizzük, hogy létezik-e a feltöltési mappa, ha nem, hozzuk létre
const uploadDir = 'uploads/info';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Ide kerülnek a fájlok
  },
  filename: (req, file, cb) => {
    // Egyedi nevet adunk: időbélyeg + eredeti név tisztítva
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Szűrő: Csak képeket és PDF-eket engedünk
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Csak képek és PDF fájlok engedélyezettek!'), false);
  }
};

export const uploadMiddleware = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB
});