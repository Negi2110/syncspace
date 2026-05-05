const express = require('express');
const router = express.Router();
const authRoutes = require('./auth-routes');
const documentRoutes = require('./document-routes');
const collaboratorRoutes = require('./collaborator-routes');
const versionRoutes = require('./version-routes');
const aiRoutes = require('./ai-routes');
const exportRoutes = require('./export-routes');


router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SyncSpace API v1 is live',
        timestamp: new Date().toISOString()
    });
});

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/documents/:id/collaborators', collaboratorRoutes);
router.use('/documents/:id/versions', versionRoutes);
router.use('/ai', aiRoutes);
router.use('/documents/:id/export', exportRoutes);



module.exports = router;