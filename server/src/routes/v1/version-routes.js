const express = require('express');
const router = express.Router({ mergeParams: true });
const { VersionController } = require('../../controllers');
const {
    verifyToken,
    checkDocAccess,
    checkEditAccess
} = require('../../middlewares');

// All version routes need auth + doc access
router.use(verifyToken);
router.use(checkDocAccess);

// GET /api/v1/documents/:id/versions
router.get('/', VersionController.getVersions);

// POST /api/v1/documents/:id/versions
// Need edit access to save version
router.post(
    '/',
    checkEditAccess,
    VersionController.saveVersion
);

// GET /api/v1/documents/:id/versions/:vId
router.get('/:vId', VersionController.getVersion);

// POST /api/v1/documents/:id/versions/:vId/restore
// Need edit access to restore
router.post(
    '/:vId/restore',
    checkEditAccess,
    VersionController.restoreVersion
);

module.exports = router;