const AuthService = require('../../../src/services/auth-service');
const { UserRepository } = require('../../../src/repositories');

describe('AuthService', () => {
    describe('register', () => {
        it('should register user and return tokens', async () => {
            const result = await AuthService.register({
                name: 'Jest Test User',
                email: `jest${Date.now()}@test.com`,
                password: 'password123'
            });

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user).toHaveProperty('id');
            expect(result.user).not.toHaveProperty('password');
        });

        it('should throw error for duplicate email', async () => {
            const email = `jest-dup${Date.now()}@test.com`;

            await AuthService.register({
                name: 'First User',
                email,
                password: 'password123'
            });

            await expect(
                AuthService.register({
                    name: 'Second User',
                    email,
                    password: 'password123'
                })
            ).rejects.toThrow();
        });
    });

    describe('login', () => {
        it('should login and return tokens', async () => {
            const result = await AuthService.login({
                email: 'aman@syncspace.com',
                password: 'password123'
            });

            expect(result).toHaveProperty('accessToken');
            expect(result.user.email).toBe('aman@syncspace.com');
        });

        it('should throw error for wrong password', async () => {
            await expect(
                AuthService.login({
                    email: 'aman@syncspace.com',
                    password: 'wrongpassword'
                })
            ).rejects.toThrow();
        });
    });
});