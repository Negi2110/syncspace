const { CollaboratorService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function addCollaborator(req, res) {
    try {
        const collaborator = await CollaboratorService.addCollaborator(
            req.params.id,
            req.user.id,
            {
                email: req.body.email,
                access: req.body.access
            }
        );
        SuccessResponse.data = collaborator;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function getCollaborators(req, res) {
    try {
        const collaborators = await CollaboratorService.getCollaborators(
            req.params.id
        );
        SuccessResponse.data = collaborators;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function updateCollaboratorAccess(req, res) {
    try {
        const collaborator = await CollaboratorService.updateCollaboratorAccess(
            req.params.id,
            req.params.userId,
            req.body.access
        );
        SuccessResponse.data = collaborator;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function removeCollaborator(req, res) {
    try {
        const response = await CollaboratorService.removeCollaborator(
            req.params.id,
            req.params.userId
        );
        SuccessResponse.data = response;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

module.exports = {
    addCollaborator,
    getCollaborators,
    updateCollaboratorAccess,
    removeCollaborator
}