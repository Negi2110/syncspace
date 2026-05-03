'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Collaborator extends Model {
        static associate(models) {
            Collaborator.belongsTo(models.Document, {
                foreignKey: 'documentId',
                as: 'document'
            });
            Collaborator.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
        }
    }

    Collaborator.init({
        documentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        access: {
            type: DataTypes.ENUM('view', 'edit'),
            allowNull: false,
            defaultValue: 'view'
        }
    }, {
        sequelize,
        modelName: 'Collaborator',
    });

    return Collaborator;
};