import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import propertyRoutes from './routes/propertyRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import slugsRoutes from './routes/slugsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://admin.habibipropertydxb.com',
  'https://api.habibipropertydxb.com',
  'https://habibipropertydxb.com',
  'admin.habibipropertydxb.com',
  'www.habibipropertydxb.com'
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', propertyRoutes);
app.use('/api', enquiryRoutes);
app.use('/api', blogRoutes);
app.use('/api', emailRoutes);
app.use("/api/comments", commentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', notificationRoutes);
app.use('/api', uploadRoutes);
app.use('/api', settingsRoutes);
app.use('/api', slugsRoutes);


// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler (must come before error handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware (must be last)
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error Handler:', error);
  console.error('Error stack:', error?.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);

  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || error.status || 500;
  const errorMessage = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? errorMessage : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});