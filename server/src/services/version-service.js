const {
    VersionRepository,
    DocumentRepository
} = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

const versionRepository = new VersionRepository();
const documentRepository = new DocumentRepository();

async function saveVersion(documentId, userId) {
    try {
        // Get current document content
        const document = await documentRepository.get(documentId);

        if (!document.content) {
            throw new AppError(
                'Cannot save version of empty document',
                StatusCodes.BAD_REQUEST
            );
        }

        // Get latest version number
        const latestVersionNumber = await versionRepository
            .getLatestVersionNumber(documentId);

        // Create new version
        const version = await versionRepository.create({
            documentId,
            userId,
            content: document.content,
            versionNumber: latestVersionNumber + 1
        });

        return version;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot save version',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getVersions(documentId) {
    try {
        const versions = await versionRepository.getByDocument(documentId);
        return versions;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot fetch versions',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getVersion(versionId) {
    try {
        const version = await versionRepository.get(versionId);
        return version;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot fetch version',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function restoreVersion(documentId, versionId, userId) {
    try {
        // Get the version to restore
        const version = await versionRepository.get(versionId);

        // Make sure version belongs to this document
        if (version.documentId !== parseInt(documentId)) {
            throw new AppError(
                'Version does not belong to this document',
                StatusCodes.BAD_REQUEST
            );
        }

        // Save current state as a new version before restoring
        // So user can undo the restore if needed
        const document = await documentRepository.get(documentId);
        if (document.content) {
            const latestVersionNumber = await versionRepository
                .getLatestVersionNumber(documentId);

            await versionRepository.create({
                documentId,
                userId,
                content: document.content,
                versionNumber: latestVersionNumber + 1
            });
        }

        // Restore document to version content
        const restored = await documentRepository.update(documentId, {
            content: version.content
        });

        return restored;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot restore version',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    saveVersion,
    getVersions,
    getVersion,
    restoreVersion
}