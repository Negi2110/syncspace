const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { DocumentRepository, CollaboratorRepository } = require('../repositories');

const documentRepository = new DocumentRepository();
const collaboratorRepository = new CollaboratorRepository();

// Check user is owner OR collaborator of document
async function checkDocAccess(req, res, next) {
    try {
        const documentId = req.params.id;
        const userId = req.user.id;

        const document = await documentRepository.get(documentId);

        // Owner has full access
        if (document.ownerId === userId) {
            req.document = document;
            req.accessType = 'owner';
            return next();
        }

        // Check if collaborator
        const collaboration = await collaboratorRepository.findAccess(
            documentId,
            userId
        );

        if (!collaboration) {
            throw new AppError(
                'You do not have access to this document',
                StatusCodes.FORBIDDEN
            );
        }

        req.document = document;
        req.accessType = collaboration.access; // 'view' or 'edit'
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Access check failed'
        });
    }
}

// Check user has edit access specifically
async function checkEditAccess(req, res, next) {
    try {
        if (req.accessType === 'view') {
            throw new AppError(
                'You only have view access to this document',
                StatusCodes.FORBIDDEN
            );
        }
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Access check failed'
        });
    }
}

// Check user is document owner specifically
async function checkOwnerAccess(req, res, next) {
    try {
        if (req.accessType !== 'owner') {
            throw new AppError(
                'Only the document owner can perform this action',
                StatusCodes.FORBIDDEN
            );
        }
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Access check failed'
        });
    }
}

module.exports = {
    checkDocAccess,
    checkEditAccess,
    checkOwnerAccess
};