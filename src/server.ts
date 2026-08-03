import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';

dotenv.config();

// Connect to MongoDB Atlas for regular development
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});