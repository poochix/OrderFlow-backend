import dotenv from 'dotenv';
import connectDB from './config/db';
import http from 'http'
import app from './app';
import { initSocket } from './config/socket';

dotenv.config();

// Connect to MongoDB Atlas for regular development
connectDB();


const PORT = process.env.PORT || 5000;

// wrapping the express app inside Raw Node Server
const server = http.createServer(app)

//Initializing socket.io and attached it to server
initSocket(server);

//calling .listen on HTTP server not on express app
server.listen(PORT, () => {
  console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('Web Socket engine initialized');
});