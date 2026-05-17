const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

/**
 * Socket.io handler — manages real-time connections.
 * 
 * Flow:
 * 1. Client connects with JWT in handshake.auth.token
 * 2. Middleware verifies token, extracts userId
 * 3. Socket joins private room: user-{userId}
 * 4. Backend controllers emit to rooms via app.get('io')
 * 5. Client receives events in real-time
 *
 * @param {import('socket.io').Server} io - Socket.io server instance
 */
module.exports = (io) => {
  // ─── JWT Authentication Middleware ───
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token expired'));
      }
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // ─── Connection Handler ───
  io.on('connection', (socket) => {
    const roomName = `user-${socket.userId}`;

    // Join user's private room
    socket.join(roomName);
    console.log(
      `⚡ Socket connected: ${socket.id} | User: ${socket.userId} | Room: ${roomName}`
    );

    // ─── Ping/Pong for connection health ───
    socket.on('ping-server', () => {
      socket.emit('pong-server', { timestamp: Date.now() });
    });

    // ─── Chat Events ───
    socket.on('private-message', async (data) => {
      const { receiverId, content } = data;
      const senderId = socket.userId;

      try {
        // Persist message to DB
        const message = await Message.create({
          senderId,
          receiverId,
          content,
        });

        const messageData = message.toJSON();

        // Emit to receiver's private room
        io.to(`user-${receiverId}`).emit('new-message', messageData);

        // Emit back to sender (optional, or rely on client-side state)
        socket.emit('message-sent', messageData);
      } catch (err) {
        console.error('Socket error - private-message:', err.message);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      io.to(`user-${receiverId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    // ─── Disconnect Handler ───
    socket.on('disconnect', (reason) => {
      console.log(
        `🔌 Socket disconnected: ${socket.id} | User: ${socket.userId} | Reason: ${reason}`
      );
      // No manual room cleanup needed — Socket.io handles it automatically
    });

    // ─── Error Handler ───
    socket.on('error', (err) => {
      console.error(`❌ Socket error for user ${socket.userId}:`, err.message);
    });
  });

  console.log('🔌 Socket.io handler initialized');
};
