const { ServerConfig } = require('../config');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../repositories');

const userRepository = new UserRepository();

async function verifyToken(req, res, next) {
    try {
        // Get token from Authorization header
        // Format: "Bearer <token>"
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(
                'No token provided',
                StatusCodes.UNAUTHORIZED
            );
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, ServerConfig.JWT_ACCESS_SECRET);

        // Attach user to request
        const user = await userRepository.get(decoded.id);
        req.user = user;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Token expired',
                error: { code: 'TOKEN_EXPIRED' }
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid token',
                error: { code: 'TOKEN_INVALID' }
            });
        }
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}

module.exports = { verifyToken };