import { Router } from 'express';
import multer from 'multer';
// @ts-ignore
import pdf from 'pdf-parse';
import { analyzeResume } from '../services/ai.service.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = decoded.user;
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
router.post('/analyze', authMiddleware, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // @ts-ignore
        const pdfData = await (pdf.default || pdf)(req.file.buffer);
        const resumeText = pdfData.text;
        const analysis = await analyzeResume(resumeText);
        res.json(analysis);
    }
    catch (error) {
        console.error('Error analyzing resume:', error);
        res.status(500).json({ message: 'Failed to analyze resume' });
    }
});
export default router;
//# sourceMappingURL=resume.routes.js.map