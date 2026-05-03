'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Comments', [
            {
                documentId: 1,
                userId: 2,
                selectedText: 'SyncSpace API design',
                comment: 'Should we add rate limiting to these endpoints?',
                isResolved: false,
                parentId: null,
                createdAt: new Date(Date.now() - 1800000), // 30 min ago
                updatedAt: new Date(Date.now() - 1800000)
            },
            {
                documentId: 1,
                userId: 1,
                selectedText: null,
                comment: 'Yes, good point. Will add in next version.',
                isResolved: false,
                parentId: 1,   // reply to comment 1
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Comments', null, {});
    }
};