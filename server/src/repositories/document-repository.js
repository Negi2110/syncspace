const CrudRepository = require('./crud-repository');
const { Document, User, Collaborator } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class DocumentRepository extends CrudRepository {
    constructor() {
        super(Document);
    }

    // Get all documents owned by a user
    async getAllByOwner(ownerId) {
        const documents = await Document.findAll({
            where: { ownerId },
            include: [{
                model: User,
                as: 'owner',
                attributes: ['id', 'name', 'email', 'avatar']
            }],
            order: [['updatedAt', 'DESC']]
        });
        return documents;
    }

    // Get document with full details (owner + collaborators)
    async getWithDetails(id) {
        const document = await Document.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email', 'avatar']
                },
                {
                    model: Collaborator,
                    as: 'collaborators',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'avatar']
                    }]
                }
            ]
        });
        if (!document) {
            throw new AppError(
                'Document not found',
                StatusCodes.NOT_FOUND
            );
        }
        return document;
    }

    // Find document by share token
    async findByShareToken(shareToken) {
        const document = await Document.findOne({
            where: { shareToken },
            include: [{
                model: User,
                as: 'owner',
                attributes: ['id', 'name', 'email', 'avatar']
            }]
        });
        if (!document) {
            throw new AppError(
                'Invalid or expired share link',
                StatusCodes.NOT_FOUND
            );
        }
        return document;
    }

    // Get all documents user has access to
    // (owned + collaborated)
    async getAllAccessible(userId) {
        const documents = await Document.findAll({
            where: {
                [Op.or]: [
                    { ownerId: userId },
                    { '$collaborators.userId$': userId }
                ]
            },
            include: [{
                model: Collaborator,
                as: 'collaborators',
                required: false
            }, {
                model: User,
                as: 'owner',
                attributes: ['id', 'name', 'email', 'avatar']
            }],
            order: [['updatedAt', 'DESC']]
        });
        return documents;
    }
}

module.exports = DocumentRepository;