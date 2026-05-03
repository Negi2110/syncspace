'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash('password123', 10);

        await queryInterface.bulkInsert('Users', [
            {
                name: 'Aman Negi',
                email: 'aman@syncspace.com',
                password: hashedPassword,
                avatar: null,
                googleId: null,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Rahul Dev',
                email: 'rahul@syncspace.com',
                password: hashedPassword,
                avatar: null,
                googleId: null,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Priya Singh',
                email: 'priya@syncspace.com',
                password: hashedPassword,
                avatar: null,
                googleId: null,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Users', null, {});
    }
};