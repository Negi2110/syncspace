const express = require('express');
const router = express.Router();
const { AuthController } = require('../../controllers');

// POST /api/v1/auth/register
router.post('/register', AuthController.register);

// POST /api/v1/auth/login
router.post('/login', AuthController.login);

// POST /api/v1/auth/logout
router.post('/logout', AuthController.logout);

// POST /api/v1/auth/refresh
router.post('/refresh', AuthController.refresh);

module.exports = router;