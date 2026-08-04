import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Application = express();

// Global Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan('dev')); // Optional: you can wrap morgan in an if(process.env.NODE_ENV !== 'test') block later

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'OrderFlow API is online and running.' });
});

// API Routes
app.use('/api/auth', authRoutes);

export default app;