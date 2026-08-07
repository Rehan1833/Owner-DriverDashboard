import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './sockets/telemetrySocket';
import { validateEmailEnvironment } from './utils/otpService';

// Load Configurations
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create http server wrapper
const server = http.createServer(app);

// Initialize Socket.io telemetry handlers
initSocket(server);

// Handle server errors (e.g. port already in use)
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER ERROR] Port ${PORT} is already in use. Terminating process to allow clean restart...`);
    process.exit(1);
  } else {
    console.error('[SERVER ERROR] Unhandled HTTP server error:', err);
  }
});

// Graceful process termination handler
const gracefulShutdown = () => {
  console.log('[SERVER] Closing HTTP server on signal...');
  server.close(() => {
    console.log('[SERVER] HTTP server closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Bootstrap Server
const startServer = async () => {
  try {
    await connectDB();
    validateEmailEnvironment();
  } catch (err: any) {
    console.warn(`[SERVER STARTUP] Database initialization warning: ${err?.message || err}. Starting Express server...`);
  }

  server.listen(PORT, () => {
    console.log(`SmartOps Express Server listening on port ${PORT}`);
  });
};

startServer();
