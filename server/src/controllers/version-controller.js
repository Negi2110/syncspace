const { VersionService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function saveVersion(req, res) {
    try {
        const version = await VersionService.saveVersion(
            req.params.id,
            req.user.id
        );
        SuccessResponse.data = version;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function getVersions(req, res) {
    try {
        const versions = await VersionService.getVersions(req.params.id);
        SuccessResponse.data = versions;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function getVersion(req, res) {
    try {
        const version = await VersionService.getVersion(req.params.vId);
        SuccessResponse.data = version;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function restoreVersion(req, res) {
    try {
        const document = await VersionService.restoreVersion(
            req.params.id,
            req.params.vId,
            req.user.id
        );
        SuccessResponse.data = document;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

module.exports = {
    saveVersion,
    getVersions,
    getVersion,
    restoreVersion
}