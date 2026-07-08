import 'dotenv/config'; // Ensures environment variables are loaded FIRST before any other imports

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import historyRoutes from './routes/history.routes.js';
import chatRoutes from './routes/chat.routes.js';
import profileRoutes from './routes/profile.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Global request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerSync AI Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);

import { initializeAI } from './services/ai.service.js';

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await initializeAI();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
