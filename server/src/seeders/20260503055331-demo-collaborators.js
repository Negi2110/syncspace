'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Collaborators', [
            {
                documentId: 1,
                userId: 2,       // Rahul has edit access on doc 1
                access: 'edit',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                documentId: 1,
                userId: 3,       // Priya has view access on doc 1
                access: 'view',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Collaborators', null, {});
    }
};