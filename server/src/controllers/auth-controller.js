const { AuthService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function register(req, res) {
    try {
        const response = await AuthService.register({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
        });

        SuccessResponse.data = {
            user: response.user,
            accessToken: response.accessToken
        };
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function login(req, res) {
    try {
        const response = await AuthService.login({
            email: req.body.email,
            password: req.body.password
        });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        SuccessResponse.data = {
            user: response.user,
            accessToken: response.accessToken
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function logout(req, res) {
    try {
        // Clear the cookie
        res.clearCookie('refreshToken');
        SuccessResponse.data = { message: 'Logged out successfully' };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function refresh(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'No refresh token provided'
            });
        }

        const response = await AuthService.refreshAccessToken(refreshToken);
        SuccessResponse.data = response;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

module.exports = {
    register,
    login,
    logout,
    refresh
}