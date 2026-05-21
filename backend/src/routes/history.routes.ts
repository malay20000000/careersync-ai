import { Router } from 'express';
import { History } from '../models/History.js';
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

router.get('/', authMiddleware, async (req: any, res: any): Promise<any> => {
  try {
    const historyList = await History.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(historyList);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', authMiddleware, async (req: any, res: any): Promise<any> => {
  try {
    const { type, title, data } = req.body;
    if (!type || !title || !data) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newHistory = new History({
      userId: req.user.id,
      type,
      title,
      data
    });

    const savedHistory = await newHistory.save();
    res.status(201).json(savedHistory);
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', authMiddleware, async (req: any, res: any): Promise<any> => {
  try {
    const historyItem = await History.findById(req.params.id);
    if (!historyItem) {
      return res.status(404).json({ message: 'History item not found' });
    }

    if (historyItem.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await History.findByIdAndDelete(req.params.id);
    res.json({ message: 'History item removed' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
