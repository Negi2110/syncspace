const request = require('supertest');
const app = require('../../../src/app');
const db = require('../../../src/models');

describe('Auth API', () => {

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User',
                    email: `test${Date.now()}@test.com`,
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data.user).toHaveProperty('id');
            expect(res.body.data.user).not.toHaveProperty('password');
        });

        it('should fail with missing required fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@test.com'
                    // missing name and password
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail with duplicate email', async () => {
            const email = `duplicate${Date.now()}@test.com`;

            // Register first time
            await request(app)
                .post('/api/v1/auth/register')
                .send({ name: 'User One', email, password: 'password123' });

            // Try to register again with same email
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ name: 'User Two', email, password: 'password123' });

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'aman@syncspace.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data.user.email).toBe('aman@syncspace.com');
        });

        it('should fail with wrong password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'aman@syncspace.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/logout');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});