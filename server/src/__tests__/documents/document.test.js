const request = require('supertest');
const app = require('../../../src/app');

// Helper to get auth token
async function getToken(email = 'aman@syncspace.com', password = 'password123') {
    const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });
    return res.body.data.accessToken;
}

describe('Document API', () => {
    let token;

    beforeAll(async () => {
        token = await getToken();
    });

    describe('GET /api/v1/documents', () => {
        it('should return all documents for authenticated user', async () => {
            const res = await request(app)
                .get('/api/v1/documents')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should fail without auth token', async () => {
            const res = await request(app)
                .get('/api/v1/documents');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/v1/documents', () => {
        it('should create a new document', async () => {
            const res = await request(app)
                .post('/api/v1/documents')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Test Document' });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Test Document');
            expect(res.body.data.ownerId).toBeDefined();
        });

        it('should create document with default title if not provided', async () => {
            const res = await request(app)
                .post('/api/v1/documents')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.statusCode).toBe(201);
            expect(res.body.data.title).toBe('Untitled Document');
        });
    });

    describe('GET /api/v1/documents/:id', () => {
        it('should return document with collaborators', async () => {
            const res = await request(app)
                .get('/api/v1/documents/1')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('collaborators');
            expect(res.body.data).toHaveProperty('owner');
        });

        it('should return 404 for non-existent document', async () => {
            const res = await request(app)
                .get('/api/v1/documents/99999')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /api/v1/documents/:id', () => {
        it('should update document title', async () => {
            const res = await request(app)
                .patch('/api/v1/documents/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated by Test' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.title).toBe('Updated by Test');
        });
    });

    describe('GET /api/v1/documents/share/:token', () => {
        it('should return document via share token without auth', async () => {
    const res = await request(app)
        .get('/api/v1/documents/share/demo-share-token-001');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
});

        it('should return 404 for invalid share token', async () => {
            const res = await request(app)
                .get('/api/v1/documents/share/invalid-token-xyz');

            expect(res.statusCode).toBe(404);
        });
    });
});