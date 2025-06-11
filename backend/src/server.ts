import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // For parsing httpOnly cookies
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import prisma from './config/prisma'; // Prisma client instance
import checkoutRoutes from './routes/checkoutRoutes';
import boatsRoutes from './routes/boatsRoutes';
import portsRoutes from './routes/portsRoutes';
import webhookRoutes from './routes/webhookRoutes';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Set the server port from environment variables or default to 5000
const PORT = process.env.SERVER_PORT || 5000;

// Set the client URL from environment variables or falls back to localhost:3000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ----------------------------------------------------
// Middleware Setup
// ----------------------------------------------------

// Enable CORS (Cross-Origin Resource Sharing)
// make requests to backend.
app.use(cors({
  origin: CLIENT_URL, // Allow requests only from React frontend URL
  credentials: true,  // Allowing cookies (httpOnly JWT) to be sent and received
}));

// The webhook route defined before global express.json() middleware.
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

// Parse JSON request bodies.
app.use(express.json());

// Parse cookies from incoming requests.
// It's necessary for `authenticateJWT` middleware to read the 'jwt' cookie.
app.use(cookieParser());

// ----------------------------------------------------
// Route Setup
// ----------------------------------------------------

// Authentication routes
app.use('/auth', authRoutes);

// User-specific API routes
app.use('/api', userRoutes);
app.use('/api/boats', boatsRoutes);
app.use('/api/ports', portsRoutes);

// Admin-specific API route
// These route require authentication and ADMIN role.
app.use('/api/admin', adminRoutes);

// Checkout route for handling Stripe payment sessions and related logic.
app.use('/api/checkout', checkoutRoutes);

// Basic home route for testing server status
app.get('/', (req, res) => {
  res.send('Boat Booking Backend API is running!');
});

// ----------------------------------------------------
// Server Start
// ----------------------------------------------------

// Connect to the database and start the server
async function startServer() {
  try {
    // Connect Prisma Client to the database
    await prisma.$connect();
    console.log('Database connected successfully!');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`CORS enabled for client: ${CLIENT_URL}`);
    });
  } catch (error) {
    console.error('Failed to connect to database or start server:', error);
    process.exit(1); // Exit the process if connection fails
  }
}

// Call the function to start the server
startServer();

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('Prisma Client disconnected from database.');
});
