import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (server: http.Server): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Telemetry client registered: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Telemetry client offline: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io telemetry controller not initialized!');
  }
  return io;
};

export const emitTelemetryUpdate = (data: any) => {
  if (io) {
    io.emit('telemetryUpdate', data);
  }
};

export const emitPodUpdate = (data: any) => {
  if (io) {
    io.emit('podUpdate', data);
  }
};
