'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Version extends Model {
        static associate(models) {
            Version.belongsTo(models.Document, {
                foreignKey: 'documentId',
                as: 'document'
            });
            Version.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'savedBy'
            });
        }
    }

    Version.init({
        documentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        versionNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        sequelize,
        modelName: 'Version',
    });

    return Version;
};