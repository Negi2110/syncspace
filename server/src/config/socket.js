const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const ServerConfig = require('./server-config');
const { UserRepository } = require('../repositories');

const userRepository = new UserRepository();

// Track who is in which document room
// { documentId: [{ userId, name, avatar, socketId }] }
const documentPresence = {};

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Auth middleware for socket connections
    io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('No token provided'));
        }


        const decoded = jwt.verify(
            token,
            ServerConfig.JWT_ACCESS_SECRET
        );

        const user = await userRepository.get(decoded.id);
        socket.user = user;
        next();
    } catch (error) {
        console.log('Socket auth error:', error.message);
        next(new Error('Invalid token'));
    }
});

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // User opens a document
        socket.on('join-document', (documentId) => {
            socket.join(documentId);

            // Add to presence tracking
            if (!documentPresence[documentId]) {
                documentPresence[documentId] = [];
            }

            // Remove any existing entry for this user
            documentPresence[documentId] = documentPresence[documentId]
                .filter(u => u.userId !== socket.user.id);

            // Add fresh entry
            documentPresence[documentId].push({
                userId: socket.user.id,
                name: socket.user.name,
                avatar: socket.user.avatar,
                socketId: socket.id
            });

            // Tell everyone in room who is present
            io.to(documentId).emit(
                'presence-update',
                documentPresence[documentId]
            );

            console.log(
                `${socket.user.name} joined document ${documentId}`
            );
        });

        // User closes a document
        socket.on('leave-document', (documentId) => {
            socket.leave(documentId);
            removeFromPresence(documentId, socket.id, io);
        });

        // User disconnects (closes browser/tab)
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);

            // Remove from all document rooms they were in
            Object.keys(documentPresence).forEach(documentId => {
                removeFromPresence(documentId, socket.id, io);
            });
        });
    });

    return io;
}

function removeFromPresence(documentId, socketId, io) {
    if (!documentPresence[documentId]) return;

    documentPresence[documentId] = documentPresence[documentId]
        .filter(u => u.socketId !== socketId);

    // Notify remaining users
    io.to(documentId).emit(
        'presence-update',
        documentPresence[documentId]
    );

    // Clean up empty rooms
    if (documentPresence[documentId].length === 0) {
        delete documentPresence[documentId];
    }
}

module.exports = { initSocket };