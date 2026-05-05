const express = require('express');
const http = require('http');
const { ServerConfig } = require('./src/config');
const apiRoutes = require('./src/routes');
const db = require('./src/models');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { initSocket } = require('./src/config/socket');
const app = express();

// Create HTTP server from Express app
const server = http.createServer(app);

// Init Socket.io on the HTTP server
const io = initSocket(server);

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes if needed later
app.set('io', io);

// Routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Start server only after DB connects
db.sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established successfully');
        server.listen(ServerConfig.PORT, () => {
            console.log(`Successfully started SyncSpace server on PORT: ${ServerConfig.PORT}`);
        });
    })
    .catch((err) => {
        console.error('Unable to connect to database:', err);
        process.exit(1);
    });