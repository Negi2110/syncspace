const CrudRepository = require('./crud-repository');
const { Collaborator, User } = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class CollaboratorRepository extends CrudRepository {
    constructor() {
        super(Collaborator);
    }

    // Get all collaborators for a document
    async getByDocument(documentId) {
        const collaborators = await Collaborator.findAll({
            where: { documentId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'avatar']
            }]
        });
        return collaborators;
    }

    // Check if user has access to document
    async findAccess(documentId, userId) {
        const collaborator = await Collaborator.findOne({
            where: { documentId, userId }
        });
        return collaborator; // null if no access
    }

    // Remove collaborator by documentId + userId
    async removeAccess(documentId, userId) {
        const response = await Collaborator.destroy({
            where: { documentId, userId }
        });
        if (!response) {
            throw new AppError(
                'Collaborator not found',
                StatusCodes.NOT_FOUND
            );
        }
        return response;
    }
}

module.exports = CollaboratorRepository;