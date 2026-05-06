const request = require('supertest');
const app = require('../../../src/app');
const jwt = require('jsonwebtoken');
const { ServerConfig } = require('../../../src/config');

describe('Auth Middleware', () => {
    it('should reject request with no token', async () => {
        const res = await request(app)
            .get('/api/v1/documents');

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('No token provided');
    });

    it('should reject request with invalid token', async () => {
        const res = await request(app)
            .get('/api/v1/documents')
            .set('Authorization', 'Bearer invalidtoken123');

        expect(res.statusCode).toBe(401);
        expect(res.body.error.code).toBe('TOKEN_INVALID');
    });

    it('should reject expired token', async () => {
        // Create a token that's already expired
        const expiredToken = jwt.sign(
            { id: 1, email: 'aman@syncspace.com' },
            ServerConfig.JWT_ACCESS_SECRET,
            { expiresIn: '0s' }
        );

        const res = await request(app)
            .get('/api/v1/documents')
            .set('Authorization', `Bearer ${expiredToken}`);

        expect(res.statusCode).toBe(401);
        expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should allow request with valid token', async () => {
        // Login to get valid token
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'aman@syncspace.com',
                password: 'password123'
            });

        const token = loginRes.body.data.accessToken;

        const res = await request(app)
            .get('/api/v1/documents')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
});