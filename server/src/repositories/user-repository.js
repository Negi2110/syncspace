const CrudRepository = require('./crud-repository');
const { User } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        const user = await User.findOne({
            where: { email }
        });
        if (!user) {
            throw new AppError(
                'No user found with this email',
                StatusCodes.NOT_FOUND
            );
        }
        return user;
    }

    async findByGoogleId(googleId) {
        const user = await User.findOne({
            where: { googleId }
        });
        return user; // null if not found, handled in service
    }

    async emailExists(email) {
        const user = await User.findOne({
            where: { email }
        });
        return !!user; // returns true or false
    }

    // Override get to never return password
async get(id) {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
    });
    if (!user) {
        throw new AppError(
            'Not able to find the resource',
            StatusCodes.NOT_FOUND
        );
    }
    return user;
}
}

module.exports = UserRepository;