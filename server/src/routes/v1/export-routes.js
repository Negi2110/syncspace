const express = require('express');
const router = express.Router({ mergeParams: true });
const { ExportController } = require('../../controllers');
const {
    verifyToken,
    checkDocAccess
} = require('../../middlewares');

router.use(verifyToken);
router.use(checkDocAccess);

// GET /api/v1/documents/:id/export/markdown
router.get('/markdown', ExportController.exportMarkdown);

// GET /api/v1/documents/:id/export/pdf
router.get('/pdf', ExportController.exportPDF);

module.exports = router;