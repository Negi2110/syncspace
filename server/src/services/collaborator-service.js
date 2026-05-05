const {
    CollaboratorRepository,
    UserRepository,
    DocumentRepository
} = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

const collaboratorRepository = new CollaboratorRepository();
const userRepository = new UserRepository();
const documentRepository = new DocumentRepository();

async function addCollaborator(documentId, ownerUserId, data) {
    try {
        // Find user by email
        const userToAdd = await userRepository.findByEmail(data.email);

        // Cannot add yourself as collaborator
        if (userToAdd.id === ownerUserId) {
            throw new AppError(
                'You cannot add yourself as a collaborator',
                StatusCodes.BAD_REQUEST
            );
        }

        // Check if already a collaborator
        const existingAccess = await collaboratorRepository.findAccess(
            documentId,
            userToAdd.id
        );
        if (existingAccess) {
            throw new AppError(
                'User is already a collaborator on this document',
                StatusCodes.CONFLICT
            );
        }

        // Add collaborator
        const collaborator = await collaboratorRepository.create({
            documentId,
            userId: userToAdd.id,
            access: data.access || 'view'
        });

        return collaborator;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot add collaborator',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getCollaborators(documentId) {
    try {
        const collaborators = await collaboratorRepository.getByDocument(
            documentId
        );
        return collaborators;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot fetch collaborators',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function updateCollaboratorAccess(documentId, userId, access) {
    try {
        // Find the collaborator record
        const collaborator = await collaboratorRepository.findAccess(
            documentId,
            userId
        );
        if (!collaborator) {
            throw new AppError(
                'Collaborator not found on this document',
                StatusCodes.NOT_FOUND
            );
        }

        // Update access level
        const updated = await collaboratorRepository.update(
            collaborator.id,
            { access }
        );
        return updated;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot update collaborator access',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function removeCollaborator(documentId, userId) {
    try {
        // Check collaborator exists first
        const collaborator = await collaboratorRepository.findAccess(
            documentId,
            userId
        );
        if (!collaborator) {
            throw new AppError(
                'Collaborator not found on this document',
                StatusCodes.NOT_FOUND
            );
        }

        await collaboratorRepository.removeAccess(documentId, userId);
        return { message: 'Collaborator removed successfully' };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot remove collaborator',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    addCollaborator,
    getCollaborators,
    updateCollaboratorAccess,
    removeCollaborator
}