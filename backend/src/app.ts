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

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check API
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Bind Enterprise Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/pod', podRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/users', userRoutes);


// Global Error Handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;
