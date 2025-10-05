// src/socket.js
import { Server } from 'socket.io';
import { userHandler } from './handlers/userHandler.js';
import { pollHandler } from './handlers/pollHandler.js';
import { EVENTS } from './utils/constant.js';

export const initSocket = (server, sessionMiddleware) => {
  const io = new Server(server, { /* ... cors config ... */ });

  // Share session middleware with Socket.IO
  io.engine.use(sessionMiddleware);

  // ADDED: Security Middleware for Socket.IO
  io.use((socket, next) => {
    const session = socket.request.session;
    if (session && session.passport && session.passport.user) {
      // If the user is authenticated, attach their user object to the socket
      socket.user = session.passport.user;
    }
    next();
  });

  io.on(EVENTS.connection, (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);
    userHandler(io, socket);
    pollHandler(io, socket);
  });

  return io;
};