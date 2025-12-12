const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const pneuRoutes = require('../routes/pneu.routes');
const { errorHandler } = require('../middlewares/errorHandler.middleware');
const User = require('../models/User.model');
const Pneu = require('../models/Pneu.model');
const Camion = require('../models/Camion.model');

const app = express();
app.use(express.json());
app.use('/api/pneus', pneuRoutes);
app.use(errorHandler);

let adminToken;
let chauffeurToken;
let testCamion;

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await Pneu.deleteMany({});
    await Camion.deleteMany({});
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

    testCamion = await Camion.create({
        matricule: 'TEST-123',
        marque: 'Mercedes',
        modele: 'Actros',
        annee: 2023,
        kilometrage: 50000
    });
});

describe('GET /api/pneus', () => {
    it('devrait retourner tous les pneus (admin)', async () => {
        await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 80000,
            statut: 'bon'
        });

        const response = await request(app)
            .get('/api/pneus')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(1);
    });

    it('devrait retourner 403 si chauffeur', async () => {
        const response = await request(app)
            .get('/api/pneus')
            .set('Authorization', `Bearer ${chauffeurToken}`);

        expect(response.status).toBe(403);
    });

    it('devrait retourner 401 si pas de token', async () => {
        const response = await request(app)
            .get('/api/pneus');

        expect(response.status).toBe(401);
    });
});

describe('GET /api/pneus/:id', () => {
    it('devrait retourner un pneu par ID', async () => {
        const pneu = await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 80000,
            statut: 'bon'
        });

        const response = await request(app)
            .get(`/api/pneus/${pneu._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.reference).toBe('MIC-001');
    });

    it('devrait retourner 404 si pneu n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/pneus/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
    });
});

describe('POST /api/pneus', () => {
    it('devrait créer un nouveau pneu', async () => {
        const pneuData = {
            reference: 'MIC-002',
            camion: testCamion._id.toString(),
            position: 'avant droit',
            kmPose: 40000,
            kmMax: 80000,
            prix: 500,
            statut: 'bon'
        };

        const response = await request(app)
            .post('/api/pneus')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(pneuData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.reference).toBe('MIC-002');
    });

    it('devrait retourner erreur si camion n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .post('/api/pneus')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                reference: 'MIC-003',
                camion: fakeId.toString(),
                position: 'avant gauche',
                kmPose: 40000,
                kmMax: 80000
            });

        expect(response.status).toBe(404);
    });

    it('devrait retourner erreur si position déjà occupée', async () => {
        await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 80000,
            statut: 'bon'
        });

        const response = await request(app)
            .post('/api/pneus')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                reference: 'MIC-004',
                camion: testCamion._id.toString(),
                position: 'avant gauche',
                kmPose: 40000,
                kmMax: 80000
            });

        expect(response.status).toBe(400);
    });
});

describe('GET /api/pneus/camion/:camionId', () => {
    it('devrait retourner les pneus d\'un camion', async () => {
        await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 80000,
            statut: 'bon'
        });

        const response = await request(app)
            .get(`/api/pneus/camion/${testCamion._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(1);
    });
});

describe('GET /api/pneus/:id/usure', () => {
    it('devrait calculer l\'usure d\'un pneu', async () => {
        const pneu = await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 80000,
            statut: 'bon'
        });

        const response = await request(app)
            .get(`/api/pneus/${pneu._id}/usure`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.usure).toBeTruthy();
        expect(response.body.data.usure.pourcentageUsure).toBeGreaterThanOrEqual(0);
    });

    it('devrait retourner 404 si pneu n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/pneus/${fakeId}/usure`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
    });
});

describe('PUT /api/pneus/:id', () => {
    it('devrait modifier un pneu', async () => {
        const pneu = await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 80000,
            statut: 'bon'
        });

        const response = await request(app)
            .put(`/api/pneus/${pneu._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                reference: 'MIC-001',
                camion: testCamion._id.toString(),
                position: 'avant gauche',
                kmPose: 40000,
                kmMax: 80000,
                prix: 600,
                statut: 'usé'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.prix).toBe(600);
        expect(response.body.data.statut).toBe('usé');
    });

    it('devrait retourner 404 si pneu n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/pneus/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                reference: 'MIC-001',
                camion: testCamion._id.toString(),
                position: 'avant gauche',
                kmPose: 40000,
                kmMax: 80000
            });

        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/pneus/:id', () => {
    it('devrait supprimer un pneu', async () => {
        const pneu = await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 80000,
            statut: 'bon'
        });

        const response = await request(app)
            .delete(`/api/pneus/${pneu._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const deleted = await Pneu.findById(pneu._id);
        expect(deleted).toBeNull();
    });

    it('devrait retourner 404 si pneu n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/pneus/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
    });
});

describe('GET /api/pneus/alertes', () => {
    it('devrait retourner les pneus en alerte', async () => {
        await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 50000,
            statut: 'usé'
        });

        const response = await request(app)
            .get('/api/pneus/alertes')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBeGreaterThan(0);
    });
});

describe('POST /api/pneus/:id/remplacer', () => {
    it('devrait remplacer un pneu', async () => {
        const ancienPneu = await Pneu.create({
            reference: 'MIC-001',
            camion: testCamion._id,
            position: 'avant gauche',
            kmPose: 40000,
            kmMax: 50000,
            statut: 'usé'
        });

        const response = await request(app)
            .post(`/api/pneus/${ancienPneu._id}/remplacer`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                nouveauPneu: {
                    reference: 'MIC-002',
                    kmPose: 50000,
                    kmMax: 90000,
                    prix: 600
                }
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.ancienPneu.statut).toBe('remplacé');
        expect(response.body.data.nouveauPneu.reference).toBe('MIC-002');
    });

    it('devrait retourner 404 si pneu n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .post(`/api/pneus/${fakeId}/remplacer`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                nouveauPneu: {
                    reference: 'MIC-002',
                    kmPose: 50000,
                    kmMax: 90000,
                    prix: 600
                }
            });

        expect(response.status).toBe(404);
    });
});
