const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const authRoutes = require('../routes/auth.routes');
const { errorHandler } = require('../middlewares/errorHandler.middleware');
const User = require('../models/User.model');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    console.log('✅ Connecté à test DB');
});

// Après TOUS les tests
afterAll(async () => {
    await mongoose.connection.close();
    console.log('✅ Déconnecté de test DB');
});

// Avant CHAQUE test - nettoyer database
beforeEach(async () => {
    await User.deleteMany({});
});


// ==================== TESTS ====================
describe('POST /api/auth/register', () => {

    it('devrait créer un nouveau user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Test',
                prenom: 'User',
                email: 'test@test.com',
                password: 'Test123',
                role: 'admin'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('test@test.com');
        expect(response.body.data.token).toBeDefined();
    });

    it('devrait retourner erreur si email existe', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Test',
                prenom: 'User',
                email: 'duplicate@test.com',
                password: 'Test123',
                role: 'admin'
            });

        // Deuxième user avec même email
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Test2',
                prenom: 'User2',
                email: 'duplicate@test.com',
                password: 'Test456',
                role: 'admin'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner erreur si données invalides', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Test',
                // email manquant
                password: 'Test123',
                role: 'admin'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});


describe('POST /api/auth/login', () => {

    it('devrait connecter user avec succès', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Test',
                prenom: 'User',
                email: 'login@test.com',
                password: 'Test123',
                role: 'admin'
            });

        // Login
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@test.com',
                password: 'Test123'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
    });

    it('devrait retourner erreur si password incorrect', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Test',
                prenom: 'User',
                email: 'test@test.com',
                password: 'Test123',
                role: 'admin'
            });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'WrongPassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner erreur si user n\'existe pas', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@test.com',
                password: 'Test123'
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe('POST /api/auth/logout', () => {

    it('devrait logout user avec succès', async () => {
        // Register + Login
        const loginRes = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Test',
                prenom: 'User',
                email: 'test@test.com',
                password: 'Test123',
                role: 'admin'
            });

        const token = loginRes.body.data.token;

        // Logout
        const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('devrait retourner erreur si pas de token', async () => {
        const response = await request(app)
            .post('/api/auth/logout');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});