const express = require('express');
const router = express.Router();
const authRoutes = require('./auth-routes');
const documentRoutes = require('./document-routes');

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SyncSpace API v1 is live',
        timestamp: new Date().toISOString()
    });
});

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);

module.exports = router;