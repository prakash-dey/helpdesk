import { Server, Socket } from 'socket.io';
import { logger } from '@/utils/logger';

export function registerSocketEvents(io: Server, socket: Socket): void {
  // Join a specific ticket room for live updates
  socket.on('ticket:join', (ticketId: string) => {
    void socket.join(`ticket:${ticketId}`);
    logger.debug('Socket joined ticket room', { socketId: socket.id, ticketId });
  });

  socket.on('ticket:leave', (ticketId: string) => {
    void socket.leave(`ticket:${ticketId}`);
  });

  // Join a team room
  socket.on('team:join', (teamId: string) => {
    void socket.join(`team:${teamId}`);
  });

  socket.on('team:leave', (teamId: string) => {
    void socket.leave(`team:${teamId}`);
  });

  // Agent presence — broadcast to org room
  socket.on('presence:online', () => {
    const { userId, orgId } = socket.data as { userId: string; orgId: string };
    socket.to(`org:${orgId}`).emit('agent.presence', { userId, status: 'online' });
  });

  socket.on('disconnect', () => {
    const { userId, orgId } = socket.data as { userId: string; orgId: string };
    if (orgId) {
      socket.to(`org:${orgId}`).emit('agent.presence', { userId, status: 'offline' });
    }
  });
}

// Helpers for broadcasting from service layer
export function broadcastTicketEvent(io: Server, orgId: string, event: string, payload: unknown): void {
  io.to(`org:${orgId}`).emit(event, payload);
}

export function broadcastToTicket(io: Server, ticketId: string, event: string, payload: unknown): void {
  io.to(`ticket:${ticketId}`).emit(event, payload);
}
