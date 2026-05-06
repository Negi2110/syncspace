const http = require('http');
const { ServerConfig } = require('./src/config');
const db = require('./src/models');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');
const { ExpressPeerServer } = require('peer');

const server = http.createServer(app);
const io = initSocket(server);

// PeerJS signaling server
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
});
app.use('/peerjs', peerServer);

app.set('io', io);

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