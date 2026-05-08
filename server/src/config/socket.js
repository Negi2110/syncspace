const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const ServerConfig = require('./server-config');
const {
    UserRepository,
    DocumentRepository,
    CollaboratorRepository
} = require('../repositories');

const userRepository = new UserRepository();
const documentRepository = new DocumentRepository();
const collaboratorRepository = new CollaboratorRepository();

// Track presence per document
const documentPresence = {};

const CURSOR_COLORS = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#00BCD4', '#009688',
    '#4CAF50', '#FF9800', '#FF5722'
];

function getUserColor(documentId, userId) {
    const users = documentPresence[documentId] || [];
    const index = users.findIndex(u => u.userId === userId);
    return CURSOR_COLORS[index % CURSOR_COLORS.length];
}

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Auth middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('No token provided'));

            const decoded = jwt.verify(token, ServerConfig.JWT_ACCESS_SECRET);
            const user = await userRepository.get(decoded.id);
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // ─── JOIN DOCUMENT ───────────────────────────────────
        socket.on('join-document', async (documentId) => {
            try {
                // Check document exists
                const document = await documentRepository.get(documentId);

                // Check if owner
                const isOwner = document.ownerId === socket.user.id;

                if (!isOwner) {
                    // Check if collaborator
                    const collaboration = await collaboratorRepository.findAccess(
                        documentId,
                        socket.user.id
                    );

                    if (!collaboration) {
                        socket.emit('access-denied', {
                            message: 'You do not have access to this document'
                        });
                        console.log(`${socket.user.name} denied access to doc ${documentId}`);
                        return;
                    }
                }

                // Access verified — join room
                socket.join(documentId);
                socket.currentDocument = documentId;

                if (!documentPresence[documentId]) {
                    documentPresence[documentId] = [];
                }

                documentPresence[documentId] = documentPresence[documentId]
                    .filter(u => u.userId !== socket.user.id);

                documentPresence[documentId].push({
                    userId: socket.user.id,
                    name: socket.user.name,
                    avatar: socket.user.avatar,
                    socketId: socket.id,
                    color: getUserColor(documentId, socket.user.id)
                });

                io.to(documentId).emit(
                    'presence-update',
                    documentPresence[documentId]
                );

                console.log(`${socket.user.name} joined document ${documentId}`);

            } catch (error) {
                socket.emit('access-denied', {
                    message: 'Document not found'
                });
            }
        });

        // ─── DOCUMENT CHANGE ─────────────────────────────────
        socket.on('document-change', (data) => {
            const { documentId, delta, timestamp } = data;
            socket.to(documentId).emit('document-update', {
                delta,
                timestamp,
                userId: socket.user.id,
                userName: socket.user.name
            });
        });

        // ─── CURSOR MOVE ──────────────────────────────────────
        socket.on('cursor-move', (data) => {
            const { documentId, position } = data;
            const presenceEntry = (documentPresence[documentId] || [])
                .find(u => u.userId === socket.user.id);

            socket.to(documentId).emit('cursor-update', {
                userId: socket.user.id,
                name: socket.user.name,
                color: presenceEntry?.color || '#2196F3',
                position
            });
        });

        // ─── TYPING INDICATOR ────────────────────────────────
        socket.on('typing-start', (documentId) => {
            socket.to(documentId).emit('user-typing', {
                userId: socket.user.id,
                name: socket.user.name
            });
        });

        socket.on('typing-stop', (documentId) => {
            socket.to(documentId).emit('user-stopped-typing', {
                userId: socket.user.id
            });
        });

        // ─── LEAVE DOCUMENT ──────────────────────────────────
        socket.on('leave-document', (documentId) => {
            socket.leave(documentId);
            socket.currentDocument = null;
            removeFromPresence(documentId, socket.id, io);
        });

        // ─── DISCONNECT ───────────────────────────────────────
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);
            Object.keys(documentPresence).forEach(documentId => {
                removeFromPresence(documentId, socket.id, io);
            });
        });

        // ─── VOICE ROOM ───────────────────────────────────────
        socket.on('voice-start', (documentId) => {
            io.to(documentId).emit('voice-room-started', {
                startedBy: {
                    userId: socket.user.id,
                    name: socket.user.name,
                    avatar: socket.user.avatar
                },
                documentId
            });
            console.log(`${socket.user.name} started voice room in doc ${documentId}`);
        });

        socket.on('voice-join', (data) => {
            const { documentId, peerId } = data;
            socket.to(documentId).emit('voice-user-joined', {
                userId: socket.user.id,
                name: socket.user.name,
                avatar: socket.user.avatar,
                peerId
            });
            console.log(`${socket.user.name} joined voice room in doc ${documentId}`);
        });

        socket.on('voice-speaking', (data) => {
            const { documentId, isSpeaking } = data;
            socket.to(documentId).emit('voice-speaking-update', {
                userId: socket.user.id,
                isSpeaking
            });
        });

        socket.on('voice-leave', (documentId) => {
            socket.to(documentId).emit('voice-user-left', {
                userId: socket.user.id,
                name: socket.user.name
            });
            console.log(`${socket.user.name} left voice room in doc ${documentId}`);
        });

        socket.on('voice-end', (documentId) => {
            io.to(documentId).emit('voice-room-ended', {
                endedBy: socket.user.name
            });
            console.log(`${socket.user.name} ended voice room in doc ${documentId}`);
        });
    });

    return io;
}

function removeFromPresence(documentId, socketId, io) {
    if (!documentPresence[documentId]) return;

    documentPresence[documentId] = documentPresence[documentId]
        .filter(u => u.socketId !== socketId);

    io.to(documentId).emit(
        'presence-update',
        documentPresence[documentId]
    );

    if (documentPresence[documentId].length === 0) {
        delete documentPresence[documentId];
    }
}

module.exports = { initSocket };