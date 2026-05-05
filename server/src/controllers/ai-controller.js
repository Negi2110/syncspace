const { AiService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function summarize(req, res) {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Content is required'
            });
        }
        const result = await AiService.summarize(content);
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function improve(req, res) {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Content is required'
            });
        }
        const result = await AiService.improve(content);
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function fixGrammar(req, res) {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Content is required'
            });
        }
        const result = await AiService.fixGrammar(content);
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function smartComment(req, res) {
    try {
        const { selectedText, context } = req.body;
        if (!selectedText) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Selected text is required'
            });
        }
        const result = await AiService.smartComment(
            selectedText,
            context || ''
        );
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function reviewSpec(req, res) {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Content is required'
            });
        }
        const result = await AiService.reviewSpec(content);
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

module.exports = {
    summarize,
    improve,
    fixGrammar,
    smartComment,
    reviewSpec
}