const CrudRepository = require('./crud-repository');
const { Comment, User } = require('../models');

class CommentRepository extends CrudRepository {
    constructor() {
        super(Comment);
    }

    // Get all top level comments for a document
    // with their replies nested
    async getByDocument(documentId) {
        const comments = await Comment.findAll({
            where: {
                documentId,
                parentId: null  // only top level comments
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar']
                },
                {
                    model: Comment,
                    as: 'replies',
                    include: [{
                        model: User,
                        as: 'author',
                        attributes: ['id', 'name', 'avatar']
                    }]
                }
            ],
            order: [['createdAt', 'ASC']]
        });
        return comments;
    }
}

module.exports = CommentRepository;