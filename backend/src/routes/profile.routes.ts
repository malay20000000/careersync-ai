import { Router } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { generateProfileSummary } from '../services/ai.service.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as any;
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

router.post('/resume', authMiddleware, upload.single('resume'), async (req: any, res: any): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    const pdfData = await (pdf.default || pdf)(req.file.buffer);
    const resumeText = pdfData.text;
    const resumeFileName = req.file.originalname;

    // Generate AI Profile Summary
    const profileSummary = await generateProfileSummary(resumeText);

    // Save to User model
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { resumeText, resumeFileName, profileSummary },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Resume saved and profile updated',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        resumeFileName: updatedUser.resumeFileName,
        profileSummary: updatedUser.profileSummary
      }
    });

  } catch (error: any) {
    console.error('Error saving resume to profile:', error);
    res.status(500).json({ message: 'Failed to save resume and generate profile summary' });
  }
});

export default router;
