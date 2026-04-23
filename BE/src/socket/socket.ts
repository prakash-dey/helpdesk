import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import IORedis from 'ioredis';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { JwtPayload } from '@/middleware/auth/auth.middleware';
import { registerSocketEvents } from './events';

let io: Server | null = null;

export function getIo(): Server | null {
  return io;
}

export function initSocket(httpServer: HttpServer): Server {
  const pubClient = new IORedis(env.REDIS_URL);
  const subClient = pubClient.duplicate();

  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    transports: ['websocket', 'polling'],
  });

  io.adapter(createAdapter(pubClient, subClient));

  // JWT auth middleware for Socket.io
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Unauthorized: missing token'));
      return;
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      socket.data.userId = payload.sub;
      socket.data.orgId = payload.orgId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Unauthorized: invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId, orgId } = socket.data as { userId: string; orgId: string };
    logger.debug('Socket connected', { socketId: socket.id, userId });

    if (orgId) {
      void socket.join(`org:${orgId}`);
    }

    registerSocketEvents(io!, socket);

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { socketId: socket.id, userId });
    });
  });

  logger.info('Socket.io initialized');
  return io;
}
