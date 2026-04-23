import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

let socketInstance: Socket | null = null;

export function useSocket(): Socket | null {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      socketInstance?.disconnect();
      socketInstance = null;
      return;
    }

    if (!socketInstance) {
      socketInstance = io('/', {
        auth: { token: accessToken },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount — keep the singleton alive
    };
  }, [accessToken]);

  return socketRef.current;
}
