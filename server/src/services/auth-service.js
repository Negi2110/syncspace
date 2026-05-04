const { UserRepository } = require('../repositories');
const { ServerConfig } = require('../config');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userRepository = new UserRepository();

function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        ServerConfig.JWT_ACCESS_SECRET,
        { expiresIn: ServerConfig.JWT_ACCESS_EXPIRY }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        ServerConfig.JWT_REFRESH_SECRET,
        { expiresIn: ServerConfig.JWT_REFRESH_EXPIRY }
    );
}

async function register(data) {
    try {
        // Check if email already exists
        const emailTaken = await userRepository.emailExists(data.email);
        if (emailTaken) {
            throw new AppError(
                'Email already registered',
                StatusCodes.CONFLICT
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await userRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            isVerified: false
        });

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            accessToken,
            refreshToken
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot register user',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function login(data) {
    try {
        // Find user by email
        const user = await userRepository.findByEmail(data.email);

        // Check password
        const isPasswordValid = await bcrypt.compare(
            data.password,
            user.password
        );
        if (!isPasswordValid) {
            throw new AppError(
                'Invalid email or password',
                StatusCodes.UNAUTHORIZED
            );
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            accessToken,
            refreshToken
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot login user',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function refreshAccessToken(refreshToken) {
    try {
        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            ServerConfig.JWT_REFRESH_SECRET
        );

        // Get user
        const user = await userRepository.get(decoded.id);

        // Generate new access token
        const accessToken = generateAccessToken(user);

        return { accessToken };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Invalid or expired refresh token',
            StatusCodes.UNAUTHORIZED
        );
    }
}

module.exports = {
    register,
    login,
    refreshAccessToken
}