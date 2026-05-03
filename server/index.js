const express = require('express');
const { ServerConfig } = require('./src/config');
const apiRoutes = require('./src/routes');
const cors = require('cors');
const db = require('./src/models');        
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Security + logging middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// 404 handler — catches any route not defined above
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
        app.listen(ServerConfig.PORT, () => {
            console.log(`Successfully started SyncSpace server on PORT: ${ServerConfig.PORT}`);
        });
    })
    .catch((err) => {
        console.error('Unable to connect to database:', err);
        process.exit(1);  // crash hard if DB fails — don't start server
    });
