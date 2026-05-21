import { Router } from 'express';
import { chatWithMentor } from '../services/ai.service.js';
import jwt from 'jsonwebtoken';

const router = Router();

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

router.post('/mentor', authMiddleware, async (req: any, res: any): Promise<any> => {
  try {
    const { history } = req.body;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ message: 'Missing or invalid chat history' });
    }

    const result = await chatWithMentor(history);
    res.json(result);

  } catch (error: any) {
    console.error('Error in mentor chat route:', error);
    res.status(500).json({ message: 'Failed to communicate with mentor' });
  }
});

export default router;
