'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Versions', [
            {
                documentId: 1,
                userId: 1,
                content: JSON.stringify({
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Initial version of the document.' }]
                        }
                    ]
                }),
                versionNumber: 1,
                createdAt: new Date(Date.now() - 3600000), // 1 hour ago
                updatedAt: new Date(Date.now() - 3600000)
            },
            {
                documentId: 1,
                userId: 2,
                content: JSON.stringify({
                    type: 'doc',
                    content: [
                        {
                            type: 'heading',
                            attrs: { level: 1 },
                            content: [{ type: 'text', text: 'API Design Spec' }]
                        },
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Second version with more content.' }]
                        }
                    ]
                }),
                versionNumber: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Versions', null, {});
    }
};