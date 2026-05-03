'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        static associate(models) {
            Comment.belongsTo(models.Document, {
                foreignKey: 'documentId',
                as: 'document'
            });
            Comment.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'author'
            });
            Comment.belongsTo(models.Comment, {
                foreignKey: 'parentId',
                as: 'parent'
            });
            Comment.hasMany(models.Comment, {
                foreignKey: 'parentId',
                as: 'replies'
            });
        }
    }

    Comment.init({
        documentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        selectedText: {
            type: DataTypes.STRING,
            allowNull: true
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isResolved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Comment',
    });

    return Comment;
};