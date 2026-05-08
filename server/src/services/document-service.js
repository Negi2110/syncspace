const { DocumentRepository, CollaboratorRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const crypto = require('crypto');

const documentRepository = new DocumentRepository();
const collaboratorRepository = new CollaboratorRepository();

async function createDocument(userId, data) {
    try {
        const document = await documentRepository.create({
            title: data.title || 'Untitled Document',
            content: null,
            ownerId: userId
        });
        return document;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot create document',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllDocuments(userId) {
    try {
        const documents = await documentRepository.getAllByOwner(userId);
        return documents;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot fetch documents',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getDocument(documentId) {
    try {
        const document = await documentRepository.getWithDetails(documentId);
        return document;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot fetch document',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function updateDocument(documentId, data) {
    try {
        const document = await documentRepository.update(documentId, {
            ...(data.title && { title: data.title }),
            ...(data.content !== undefined && { content: data.content })
        });
        return document;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot update document',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function deleteDocument(documentId) {
    try {
        await documentRepository.destroy(documentId);
        return { message: 'Document deleted successfully' };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot delete document',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function generateShareLink(documentId, access) {
    try {
        // Generate unique random token
        const shareToken = crypto.randomBytes(16).toString('hex');

        const document = await documentRepository.update(documentId, {
            shareToken,
            shareAccess: access || 'view'
        });
        return document;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot generate share link',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getDocumentByShareToken(shareToken) {
    try {
        const document = await documentRepository.findByShareToken(shareToken);
        return document;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Invalid share link',
            StatusCodes.NOT_FOUND
        );
    }
}

async function revokeShareLink(documentId) {
    try {
        const document = await documentRepository.update(documentId, {
            shareToken: null,
            shareAccess: null
        });
        return document;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot revoke share link',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}
async function getAllAccessible(userId) {
    try {
        const documents = await documentRepository.getAllAccessible(userId);
        return documents;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot fetch documents',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}
module.exports = {
    createDocument,
    getAllDocuments,
    getAllAccessible,
    getDocument,
    updateDocument,
    deleteDocument,
    generateShareLink,
    getDocumentByShareToken,
    revokeShareLink
}