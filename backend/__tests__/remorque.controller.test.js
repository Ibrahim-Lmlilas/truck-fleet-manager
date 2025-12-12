const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const remorqueRoutes = require('../routes/remorque.routes');
const {errorHandler} = require('../middlewares/errorHandler.middleware');
const User = require('../models/User.model');
const Remorque = require('../models/Remorque.model');

const app = express();
app.use(express.json());
app.use('/api/remorques', remorqueRoutes);
app.use(errorHandler);

let adminToken;
let chauffeurToken;

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    console.log('✅ Connecté à test DB');
});

afterAll(async () => {
    await mongoose.connection.close();
    console.log('✅ Déconnecté de test DB');
});

beforeEach(async () => {
    await Remorque.deleteMany({});
    await User.deleteMany({});
    
    const admin = await User.create({
        nom: 'Admin',
        prenom: 'Test',
        email: 'admin@test.com',
        password: 'Admin123',
        role: 'admin'
    });

    const chauffeur = await User.create({
        nom: 'Chauffeur',
        prenom: 'Test',
        email: 'chauffeur@test.com',
        password: 'Chauffeur123',
        role: 'chauffeur'
    });

    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    chauffeurToken = jwt.sign({ id: chauffeur._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
});

// ==================== TESTS ====================

describe('GET /api/remorques', () => {

    it('devrait retourner toutes les remorques (admin)', async () => {
        await Remorque.create({
            matricule: 'REM-123',
            type: 'frigorifique',
            capacite: 25,
            statut: 'disponible'
        });

        await Remorque.create({
            matricule: 'REM-456',
            type: 'bâchée',
            capacite: 30,
            statut: 'disponible'
        });

        const response = await request(app)
            .get('/api/remorques')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
        expect(response.body.data).toHaveLength(2);
    });

    it('devrait retourner 403 si chauffeur essaye', async () => {
        const response = await request(app)
            .get('/api/remorques')
            .set('Authorization', `Bearer ${chauffeurToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner 401 si pas de token', async () => {
        const response = await request(app)
            .get('/api/remorques');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe('POST /api/remorques', () => {

    it('devrait créer une nouvelle remorque (admin)', async () => {
        const remorqueData = {
            matricule: 'REM-NEW',
            type: 'plateau',
            capacite: 20,
            statut: 'disponible',
            remarques: 'Nouvelle remorque'
        };

        const response = await request(app)
            .post('/api/remorques')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(remorqueData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.matricule).toBe('REM-NEW');
        expect(response.body.data.type).toBe('plateau');
    });

    it('devrait retourner erreur si données invalides', async () => {
        const response = await request(app)
            .post('/api/remorques')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                matricule: 'AB',
                type: 'test'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner erreur si matricule existe déjà', async () => {
        const remorqueData = {
            matricule: 'REM-DUP',
            type: 'frigorifique',
            capacite: 25,
            statut: 'disponible'
        };

        await request(app)
            .post('/api/remorques')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(remorqueData);

        const response = await request(app)
            .post('/api/remorques')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(remorqueData);

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner 403 si chauffeur essaye', async () => {
        const response = await request(app)
            .post('/api/remorques')
            .set('Authorization', `Bearer ${chauffeurToken}`)
            .send({
                matricule: 'REM-TEST',
                type: 'bâchée',
                capacite: 20
            });

        expect(response.status).toBe(403);
    });
});

describe('GET /api/remorques/:id', () => {

    it('devrait retourner une remorque par ID', async () => {
        const remorque = await Remorque.create({
            matricule: 'REM-GET',
            type: 'citerne',
            capacite: 35,
            statut: 'disponible'
        });

        const response = await request(app)
            .get(`/api/remorques/${remorque._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.matricule).toBe('REM-GET');
    });

    it('devrait retourner 404 si remorque n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/remorques/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner 400 si ID invalide', async () => {
        const response = await request(app)
            .get('/api/remorques/invalid-id')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(400);
    });
});

describe('PUT /api/remorques/:id', () => {

    it('devrait modifier une remorque', async () => {
        const remorque = await Remorque.create({
            matricule: 'REM-UPD',
            type: 'bâchée',
            capacite: 25,
            statut: 'disponible'
        });

        const response = await request(app)
            .put(`/api/remorques/${remorque._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                matricule: 'REM-UPD',
                type: 'frigorifique',
                capacite: 30,
                statut: 'en mission',
                remarques: 'Modifiée'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.type).toBe('frigorifique');
        expect(response.body.data.capacite).toBe(30);
        expect(response.body.data.statut).toBe('en mission');
    });

    it('devrait retourner 404 si remorque n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/remorques/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                matricule: 'REM-TEST',
                type: 'plateau',
                capacite: 20
            });

        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/remorques/:id', () => {

    it('devrait supprimer une remorque', async () => {
        const remorque = await Remorque.create({
            matricule: 'REM-DEL',
            type: 'plateau',
            capacite: 20,
            statut: 'disponible'
        });

        const response = await request(app)
            .delete(`/api/remorques/${remorque._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const deleted = await Remorque.findById(remorque._id);
        expect(deleted).toBeNull();
    });

    it('devrait retourner 404 si remorque n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/remorques/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
    });

    it('devrait retourner 403 si chauffeur essaye', async () => {
        const remorque = await Remorque.create({
            matricule: 'REM-TEST',
            type: 'bâchée',
            capacite: 25
        });

        const response = await request(app)
            .delete(`/api/remorques/${remorque._id}`)
            .set('Authorization', `Bearer ${chauffeurToken}`);

        expect(response.status).toBe(403);
    });
});
