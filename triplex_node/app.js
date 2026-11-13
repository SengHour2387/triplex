import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import mapRoutes from './routes/map.js';
import tripPlanRoutes from './routes/tripPlans.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import likeRoutes from './routes/likes.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/trip-plans', tripPlanRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/users', userRoutes);


// Health check route
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'success',
      message: 'Database connected successfully',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`\u001b[32mServer running on port ${port}\u001b[0m`);
  });
}

export default app;