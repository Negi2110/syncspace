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
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PeerJS signaling server
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
});
app.use('/peerjs', peerServer);

app.set('io', io);
app.use('/api', apiRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

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