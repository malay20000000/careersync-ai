import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CareerSync AI Backend is running' });
});
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
//# sourceMappingURL=index.js.map