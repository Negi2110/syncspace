const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SyncSpace API v1 is live',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;