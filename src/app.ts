import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import orderRoutes from './routes/orderRoutes';
import aiRoutes from './routes/aiRoutes'
import analyticsRoutes from './routes/analyticsRoutes';

import userRoutes from './routes/userRoutes';

dotenv.config();

const app: Application = express();

// Global Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin: 'http://localhost:5173',   //frontend URL
    credentials: true,                 // Allows cookies and Headers to pass through
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
));
app.use(helmet());
app.use(morgan('dev')); // Optional: you can wrap morgan in an if(process.env.NODE_ENV !== 'test') block later

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'OrderFlow API is online and running.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/analytics', analyticsRoutes)

app.use('/api/user', userRoutes )

export default app;