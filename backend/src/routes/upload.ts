import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateWallet, AuthRequest } from '../middleware/auth';
import fs from 'fs';
import { prisma } from '../context';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  },
});

// Upload single file
router.post('/file', authenticateWallet, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    // Use environment variable for base URL if available, otherwise construct from request
    const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fullUrl = `${baseUrl}${fileUrl}`;

    return res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        fullUrl: fullUrl,
      },
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'File upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Upload avatar and automatically update user profile
router.post('/avatar', authenticateWallet, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      // Delete the uploaded file
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ error: 'File must be an image' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    // Use environment variable for base URL if available, otherwise construct from request
    // Prefer NEXT_PUBLIC_API_URL (frontend's API URL) for consistency
    const baseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`;
    const fullUrl = `${baseUrl}${fileUrl}`;

    console.log('Avatar upload details:');
    console.log('- Filename:', req.file.filename);
    console.log('- File path:', path.join(__dirname, '../../uploads', req.file.filename));
    console.log('- File URL:', fileUrl);
    console.log('- Base URL:', baseUrl);
    console.log('- Full URL:', fullUrl);
    console.log('- Request protocol:', req.protocol);
    console.log('- Request host:', req.get('host'));

    // Update user's avatar in database
    try {
      console.log('Updating avatar in database for user:', req.user.id);
      console.log('Avatar URL to save:', fullUrl);
      
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: fullUrl },
        select: { 
          id: true, 
          avatar: true,
          email: true,
          username: true,
        },
      });
      
      console.log('✅ Avatar updated successfully in database');
      console.log('Updated user:', updatedUser);
      
      // Verify the update
      const verifyUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { avatar: true },
      });
      console.log('Verified avatar in DB:', verifyUser?.avatar);
      
    } catch (dbError: any) {
      console.error('❌ Database update error:', dbError);
      console.error('Error details:', dbError.message, dbError.stack);
      // Still return success for upload, but log the error
      return res.status(500).json({ 
        error: 'File uploaded but failed to update profile',
        details: dbError.message,
        file: {
          filename: req.file.filename,
          url: fileUrl,
          fullUrl: fullUrl,
        },
      });
    }

    return res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        fullUrl: fullUrl,
      },
      message: 'Avatar uploaded and profile updated successfully',
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Avatar upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Upload multiple files
router.post('/files', authenticateWallet, upload.array('files', 5), (req: AuthRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`,
    }));

    return res.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Files upload error:', error);
    return res.status(500).json({ error: 'Files upload failed' });
  }
});

export default router;

