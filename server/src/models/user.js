'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Document, {
                foreignKey: 'ownerId',
                as: 'ownedDocuments'
            });
            User.hasMany(models.Collaborator, {
                foreignKey: 'userId',
                as: 'collaborations'
            });
            User.hasMany(models.Version, {
                foreignKey: 'userId',
                as: 'versions'
            });
            User.hasMany(models.Comment, {
                foreignKey: 'userId',
                as: 'comments'
            });
        }
    }

    User.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'User',
    });

    return User;
};