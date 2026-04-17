import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
// Load environment variables
dotenv.config();
// Connect to Database
connectDB();

import authRoutes from './src/routes/auth.routes.js';
import roadmapRoutes from './src/routes/roadmap.routes.js';
import sessionRoutes from './src/routes/session.routes.js';
import progressRoutes from './src/routes/progress.routes.js';


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://skillmaster.ai',
    'https://skill-master.vercel.app'
  ]
}));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'running',
    timestamp: new Date(),
    service: 'Skill Master Backend'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/progress', progressRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
