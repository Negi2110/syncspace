const { DocumentService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function createDocument(req, res) {
    try {
        const document = await DocumentService.createDocument(
            req.user.id,
            { title: req.body.title }
        );
        SuccessResponse.data = document;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function getAllDocuments(req, res) {
    try {
        const documents = await DocumentService.getAllDocuments(req.user.id);
        SuccessResponse.data = documents;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function getDocument(req, res) {
    try {
        // document already fetched in middleware
        // just get full details
        const document = await DocumentService.getDocument(req.params.id);
        SuccessResponse.data = document;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function updateDocument(req, res) {
    try {
        const document = await DocumentService.updateDocument(
            req.params.id,
            {
                title: req.body.title,
                content: req.body.content
            }
        );
        SuccessResponse.data = document;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function deleteDocument(req, res) {
    try {
        const response = await DocumentService.deleteDocument(req.params.id);
        SuccessResponse.data = response;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function generateShareLink(req, res) {
    try {
        const document = await DocumentService.generateShareLink(
            req.params.id,
            req.body.access
        );
        SuccessResponse.data = document;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function getDocumentByShareToken(req, res) {
    try {
        const document = await DocumentService.getDocumentByShareToken(
            req.params.token
        );
        SuccessResponse.data = document;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function revokeShareLink(req, res) {
    try {
        const document = await DocumentService.revokeShareLink(req.params.id);
        SuccessResponse.data = document;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

module.exports = {
    createDocument,
    getAllDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    generateShareLink,
    getDocumentByShareToken,
    revokeShareLink
}