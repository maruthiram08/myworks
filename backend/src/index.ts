import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeWebSocket } from './websocket';
import authRoutes from './routes/auth.routes';
import rideRoutes from './routes/ride.routes';
import driverRoutes from './routes/driver.routes';
import paymentRoutes from './routes/payment.routes';
import ratingRoutes from './routes/rating.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { initializeRedis } from './utils/redis';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.BACKEND_PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

// Initialize services
const startServer = async () => {
  try {
    // Initialize Redis for WebSocket scaling
    await initializeRedis();

    // Initialize WebSocket server
    initializeWebSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📡 WebSocket server initialized`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
