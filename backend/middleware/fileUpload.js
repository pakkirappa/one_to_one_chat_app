const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(uploadsDir);

// Create subdirectories for different file types
const subdirs = ['images', 'documents', 'videos', 'audio', 'others'];
subdirs.forEach(subdir => {
  fs.ensureDirSync(path.join(uploadsDir, subdir));
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'others';
    const mimeType = file.mimetype;
    
    if (mimeType.startsWith('image/')) {
      folder = 'images';
    } else if (mimeType.startsWith('video/')) {
      folder = 'videos';
    } else if (mimeType.startsWith('audio/')) {
      folder = 'audio';
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation')
    ) {
      folder = 'documents';
    }
    
    const uploadPath = path.join(uploadsDir, folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow all file types but set size limits based on type
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Videos
    'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/wmv',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a',
    // Code files
    'text/javascript', 'application/json', 'text/html', 'text/css',
    // Others
    'application/octet-stream'
  ];

  // For now, accept all files (you can customize this)
  cb(null, true);
};

// Configure upload limits based on file type
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: (req, file) => {
      if (file.mimetype.startsWith('image/')) {
        return 10 * 1024 * 1024; // 10MB for images
      } else if (file.mimetype.startsWith('video/')) {
        return 100 * 1024 * 1024; // 100MB for videos
      } else {
        return 50 * 1024 * 1024; // 50MB for other files
      }
    }
  }
});

// Helper function to get file category
const getFileCategory = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('pdf') || 
      mimetype.includes('document') || 
      mimetype.includes('text') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('presentation')) return 'document';
  return 'file';
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  upload,
  getFileCategory,
  formatFileSize,
  uploadsDir
};
