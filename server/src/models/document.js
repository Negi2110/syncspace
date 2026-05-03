'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Document extends Model {
        static associate(models) {
            Document.belongsTo(models.User, {
                foreignKey: 'ownerId',
                as: 'owner'
            });
            Document.hasMany(models.Collaborator, {
                foreignKey: 'documentId',
                as: 'collaborators'
            });
            Document.hasMany(models.Version, {
                foreignKey: 'documentId',
                as: 'versions'
            });
            Document.hasMany(models.Comment, {
                foreignKey: 'documentId',
                as: 'comments'
            });
        }
    }

    Document.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Untitled Document'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        shareToken: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        shareAccess: {
            type: DataTypes.ENUM('view', 'edit'),
            allowNull: true
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Document',
    });

    return Document;
};