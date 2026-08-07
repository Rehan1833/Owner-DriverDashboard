import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import salaryRoutes from './routes/salaryRoutes';
import fleetRoutes from './routes/fleetRoutes';
import tripRoutes from './routes/tripRoutes';
import podRoutes from './routes/podRoutes';
import mapRoutes from './routes/mapRoutes';
import userRoutes from './routes/userRoutes';
import companyRoutes from './routes/companyRoutes';
import driverRoutes from './routes/driverRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();

// Allowed Origins configuration for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

// CORS Middleware setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date(), env: process.env.NODE_ENV || 'development' });
});

// Bind Enterprise API Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/drivers', userRoutes); // Alias for /api/drivers route
app.use('/api/inventory', inventoryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/pod', podRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Route Handler for undefined /api Endpoints
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : String(err)
  });
});

export default app;
