const { ExportService } = require('../services');
const { StatusCodes } = require('http-status-codes');

async function exportMarkdown(req, res) {
    try {
        const result = await ExportService.exportMarkdown(req.params.id);

        res.setHeader('Content-Type', result.contentType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${result.filename}"`
        );
        return res.send(result.content);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

async function exportPDF(req, res) {
    try {
        const result = await ExportService.exportPDF(req.params.id);

        res.setHeader('Content-Type', result.contentType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${result.filename}"`
        );
        return res.send(result.content);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    exportMarkdown,
    exportPDF
}