const express = require('express');
const router = express.Router();
const { DocumentController } = require('../../controllers');
const {
    verifyToken,
    checkDocAccess,
    checkEditAccess,
    checkOwnerAccess
} = require('../../middlewares');

// PUBLIC route — no auth needed
router.get('/share/:token', DocumentController.getDocumentByShareToken);

// All routes below require authentication
router.use(verifyToken);

router.get('/', DocumentController.getAllDocuments);
router.post('/', DocumentController.createDocument);

// Must be BEFORE /:id
router.get('/accessible', DocumentController.getAllAccessible);

router.get('/:id', checkDocAccess, DocumentController.getDocument);
router.patch('/:id', checkDocAccess, checkEditAccess, DocumentController.updateDocument);
router.delete('/:id', checkDocAccess, checkOwnerAccess, DocumentController.deleteDocument);
router.post('/:id/share', checkDocAccess, checkOwnerAccess, DocumentController.generateShareLink);
router.delete('/:id/share', checkDocAccess, checkOwnerAccess, DocumentController.revokeShareLink);

module.exports = router;