const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const camionRoutes = require('../routes/camion.routes');
const { errorHandler } = require('../middlewares/errorHandler.middleware');
const User = require('../models/User.model');
const Camion = require('../models/Camion.model');

const app = express();
app.use(express.json());
app.use('/api/camions', camionRoutes);
app.use(errorHandler);

// Variables globales pour tokens
let adminToken;
let chauffeurToken;

// Avant TOUS les tests
beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    console.log('✅ Connecté à test DB');
});

afterAll(async () => {
    await mongoose.connection.close();
    console.log('✅ Déconnecté de test DB');
});

beforeEach(async () => {
    await Camion.deleteMany({});
    await User.deleteMany({});
    
    // Re-create users for each test
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

describe('GET /api/camions', () => {

    it('devrait retourner tous les camions (admin)', async () => {
        await Camion.create({
            matricule: 'ABC-123',
            marque: 'Mercedes',
            modele: 'Actros',
            annee: 2023,
            kilometrage: 50000
        });

        await Camion.create({
            matricule: 'DEF-456',
            marque: 'Volvo',
            modele: 'FH',
            annee: 2022,
            kilometrage: 75000
        });

        const response = await request(app)
            .get('/api/camions')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
        expect(response.body.data).toHaveLength(2);
    });

    it('devrait retourner 403 si chauffeur essaye (non autorisé)', async () => {
        const response = await request(app)
            .get('/api/camions')
            .set('Authorization', `Bearer ${chauffeurToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner 401 si pas de token', async () => {
        const response = await request(app)
            .get('/api/camions');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe('POST /api/camions', () => {

    it('devrait créer un nouveau camion (admin)', async () => {
        const camionData = {
            matricule: 'NEW-789',
            marque: 'Scania',
            modele: 'R500',
            annee: 2024,
            kilometrage: 10000,
            statut: 'disponible'
        };

        const response = await request(app)
            .post('/api/camions')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(camionData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.matricule).toBe('NEW-789');
        expect(response.body.data.marque).toBe('Scania');

    });

    it('devrait retourner erreur si données invalides', async () => {
        const response = await request(app)
            .post('/api/camions')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                matricule: 'AB',
                marque: 'Test'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner erreur si matricule existe déjà', async () => {
        const camionData = {
            matricule: 'DUP-123',
            marque: 'Mercedes',
            modele: 'Actros',
            annee: 2023,
            kilometrage: 50000
        };

        await request(app)
            .post('/api/camions')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(camionData);

        // Deuxième camion avec même matricule
        const response = await request(app)
            .post('/api/camions')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(camionData);

        expect(response.status).toBe(409); // 409 Conflict pour duplicate
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner 403 si chauffeur essaye', async () => {
        const response = await request(app)
            .post('/api/camions')
            .set('Authorization', `Bearer ${chauffeurToken}`)
            .send({
                matricule: 'TEST-123',
                marque: 'Test',
                modele: 'Test',
                annee: 2023,
                kilometrage: 50000
            });

        expect(response.status).toBe(403);
    });
});

describe('GET /api/camions/:id', () => {

    it('devrait retourner un camion par ID', async () => {
        const camion = await Camion.create({
            matricule: 'GET-123',
            marque: 'Mercedes',
            modele: 'Actros',
            annee: 2023,
            kilometrage: 50000
        });

        const response = await request(app)
            .get(`/api/camions/${camion._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.matricule).toBe('GET-123');
    });

    it('devrait retourner 404 si camion n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/camions/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner 400 si ID invalide', async () => {
        const response = await request(app)
            .get('/api/camions/invalid-id')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(400);
    });
});

describe('PUT /api/camions/:id', () => {

    it('devrait modifier un camion', async () => {
        const camion = await Camion.create({
            matricule: 'UPD-123',
            marque: 'Mercedes',
            modele: 'Actros',
            annee: 2023,
            kilometrage: 50000
        });

        const response = await request(app)
            .put(`/api/camions/${camion._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                matricule: 'UPD-123',
                marque: 'Mercedes',
                modele: 'Actros Updated',
                annee: 2024,
                kilometrage: 55000,
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.modele).toBe('Actros Updated');
        expect(response.body.data.kilometrage).toBe(55000);
    });

    it('devrait retourner 404 si camion n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/camions/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                matricule: 'TEST-123',
                marque: 'Test',
                modele: 'Test',
                annee: 2023,
                kilometrage: 50000
            });

        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/camions/:id', () => {

    it('devrait supprimer un camion', async () => {
        const camion = await Camion.create({
            matricule: 'DEL-123',
            marque: 'Mercedes',
            modele: 'Actros',
            annee: 2023,
            kilometrage: 50000
        });

        const response = await request(app)
            .delete(`/api/camions/${camion._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Vérifier que camion est supprimé
        const deleted = await Camion.findById(camion._id);
        expect(deleted).toBeNull();
    });

    it('devrait retourner 404 si camion n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/camions/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
    });
});

describe('PATCH /api/camions/:id/kilometrage', () => {

    it('devrait mettre à jour le kilométrage (admin)', async () => {
        const camion = await Camion.create({
            matricule: 'KM-123',
            marque: 'Mercedes',
            modele: 'Actros',
            annee: 2023,
            kilometrage: 50000
        });

        const response = await request(app)
            .patch(`/api/camions/${camion._id}/kilometrage`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ kilometrage: 60000 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.kilometrage).toBe(60000);
    });

    it('devrait mettre à jour le kilométrage (chauffeur)', async () => {
        const camion = await Camion.create({
            matricule: 'KM-456',
            marque: 'Volvo',
            modele: 'FH',
            annee: 2022,
            kilometrage: 75000
        });

        const response = await request(app)
            .patch(`/api/camions/${camion._id}/kilometrage`)
            .set('Authorization', `Bearer ${chauffeurToken}`)
            .send({ kilometrage: 80000 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('devrait retourner erreur si km < ancien km', async () => {
        const camion = await Camion.create({
            matricule: 'KM-789',
            marque: 'Scania',
            modele: 'R500',
            annee: 2024,
            kilometrage: 50000
        });

        const response = await request(app)
            .patch(`/api/camions/${camion._id}/kilometrage`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ kilometrage: 40000 }); // Plus petit que 50000

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner erreur si kilometrage négatif', async () => {
        const camion = await Camion.create({
            matricule: 'KM-000',
            marque: 'Mercedes',
            modele: 'Actros',
            annee: 2023,
            kilometrage: 50000
        });

        const response = await request(app)
            .patch(`/api/camions/${camion._id}/kilometrage`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ kilometrage: -1000 });

        expect(response.status).toBe(400);
    });
});
