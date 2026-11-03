import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo'
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️ Cloudinary configured successfully.');
} else {
  console.log('ℹ️ Cloudinary credentials not fully configured; using local uploads fallback with static serving.');
}

// Multer memory storage for in-memory buffer handling before streaming to Cloudinary or disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for videos/photos
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only images and video files are permitted!'), false);
    }
  },
});

// Helper to upload buffer to Cloudinary or fallback to local disk
export const uploadMediaBuffer = async (buffer, originalname, mimetype, folder = 'ashis_kirti_love') => {
  if (isCloudinaryConfigured) {
    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          transformation: resourceType === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
          });
        }
      );
      uploadStream.end(buffer);
    });
  } else {
    // Local uploads directory fallback
    const uploadsDir = path.resolve('uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(originalname) || (mimetype.startsWith('video/') ? '.mp4' : '.jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${filename}`,
      publicId: filename,
      resourceType: mimetype.startsWith('video/') ? 'video' : 'image',
    };
  }
};

// Helper to delete media
export const deleteMedia = async (publicId, resourceType = 'image') => {
  if (isCloudinaryConfigured) {
    return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } else {
    try {
      const filePath = path.resolve('uploads', publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('Could not delete local file:', e.message);
    }
    return { result: 'ok' };
  }
};

export { cloudinary };
