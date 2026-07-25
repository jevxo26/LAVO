/**
 * Singleton holder for the Socket.io Server instance.
 * Services import getIO/setIO from HERE to avoid circular imports with socket.ts.
 * socket.ts calls setIO() once during initialization.
 */
import { Server } from 'socket.io';

let _io: Server | null = null;

export const setIO = (io: Server) => {
  _io = io;
};

export const getIO = (): Server => {
  if (!_io) throw new Error('Socket.io not initialized! Call setIO() first.');
  return _io;
};
