'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Documents', [
            {
                title: 'SyncSpace API Design Spec',
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
                            content: [{ type: 'text', text: 'This document describes the SyncSpace API design.' }]
                        }
                    ]
                }),
                ownerId: 1,
                shareToken: 'demo-share-token-001',
                shareAccess: 'view',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Untitled Document',
                content: null,
                ownerId: 1,
                shareToken: null,
                shareAccess: null,
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Documents', null, {});
    }
};