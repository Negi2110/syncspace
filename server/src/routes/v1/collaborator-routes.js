const express = require('express');
const router = express.Router({ mergeParams: true });
const { CollaboratorController } = require('../../controllers');
const {
    verifyToken,
    checkDocAccess,
    checkOwnerAccess
} = require('../../middlewares');

// All collaborator routes need auth + doc access
router.use(verifyToken);
router.use(checkDocAccess);

// GET /api/v1/documents/:id/collaborators
router.get('/', CollaboratorController.getCollaborators);

// POST /api/v1/documents/:id/collaborators
// Only owner can add collaborators
router.post(
    '/',
    checkOwnerAccess,
    CollaboratorController.addCollaborator
);

// PATCH /api/v1/documents/:id/collaborators/:userId
// Only owner can change access level
router.patch(
    '/:userId',
    checkOwnerAccess,
    CollaboratorController.updateCollaboratorAccess
);

// DELETE /api/v1/documents/:id/collaborators/:userId
// Only owner can remove collaborators
router.delete(
    '/:userId',
    checkOwnerAccess,
    CollaboratorController.removeCollaborator
);

module.exports = router;