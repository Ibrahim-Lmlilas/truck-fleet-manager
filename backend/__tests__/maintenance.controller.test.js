const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const maintenanceRoutes = require('../routes/maintenance.routes');
const { errorHandler } = require('../middlewares/errorHandler.middleware');
const User = require('../models/User.model');
const Maintenance = require('../models/Maintenance.model');
const Camion = require('../models/Camion.model');

const app = express();
app.use(express.json());
app.use('/api/maintenances', maintenanceRoutes);
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
    await Maintenance.deleteMany({});
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

describe('GET /api/maintenances', () => {
    it('devrait retourner toutes les maintenances (admin)', async () => {
        await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: new Date('2024-12-31'),
            kmMaintenance: 50000,
            statut: 'planifiée'
        });

        const response = await request(app)
            .get('/api/maintenances')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(1);
    });

    it('devrait retourner 403 si chauffeur', async () => {
        const response = await request(app)
            .get('/api/maintenances')
            .set('Authorization', `Bearer ${chauffeurToken}`);

        expect(response.status).toBe(403);
    });

    it('devrait retourner 401 si pas de token', async () => {
        const response = await request(app)
            .get('/api/maintenances');

        expect(response.status).toBe(401);
    });
});

describe('GET /api/maintenances/:id', () => {
    it('devrait retourner une maintenance par ID', async () => {
        const maintenance = await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: new Date('2024-12-31'),
            kmMaintenance: 50000,
            statut: 'planifiée'
        });

        const response = await request(app)
            .get(`/api/maintenances/${maintenance._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.type).toBe('vidange');
    });

    it('devrait retourner 404 si maintenance n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/maintenances/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
    });
});

describe('POST /api/maintenances', () => {
    it('devrait créer une nouvelle maintenance', async () => {
        const maintenanceData = {
            vehicule: testCamion._id.toString(),
            type: 'vidange',
            datePrevu: '2024-12-31',
            kmMaintenance: 50000,
            cout: 500,
            statut: 'planifiée'
        };

        const response = await request(app)
            .post('/api/maintenances')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(maintenanceData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.type).toBe('vidange');
    });

    it('devrait retourner erreur si véhicule n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .post('/api/maintenances')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                vehicule: fakeId.toString(),
                type: 'vidange',
                datePrevu: '2024-12-31',
                kmMaintenance: 50000
            });

        expect(response.status).toBe(404);
    });

    it('devrait retourner erreur si kmMaintenance < kilometrage actuel', async () => {
        const response = await request(app)
            .post('/api/maintenances')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                vehicule: testCamion._id.toString(),
                type: 'vidange',
                datePrevu: '2024-12-31',
                kmMaintenance: 30000
            });

        expect(response.status).toBe(400);
    });
});

describe('GET /api/maintenances/vehicule/:vehiculeId', () => {
    it('devrait retourner les maintenances d\'un véhicule', async () => {
        await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: new Date('2024-12-31'),
            kmMaintenance: 50000,
            statut: 'planifiée'
        });

        const response = await request(app)
            .get(`/api/maintenances/vehicule/${testCamion._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(1);
    });
});

describe('GET /api/maintenances/vehicule/:vehiculeId/echeances', () => {
    it('devrait calculer les échéances par km', async () => {
        await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: new Date('2024-12-31'),
            dateFait: new Date('2024-01-01'),
            kmMaintenance: 40000,
            statut: 'effectuée'
        });

        const response = await request(app)
            .get(`/api/maintenances/vehicule/${testCamion._id}/echeances`)
            .query({ typeMaintenance: 'vidange', intervalleKm: '10000' })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.echeances.km).toBeTruthy();
    });

    it('devrait calculer les échéances par jours', async () => {
        const response = await request(app)
            .get(`/api/maintenances/vehicule/${testCamion._id}/echeances`)
            .query({ typeMaintenance: 'vidange', intervalleJours: '90' })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.echeances.date).toBeTruthy();
    });
});

describe('PATCH /api/maintenances/:id/effectuee', () => {
    it('devrait marquer une maintenance comme effectuée', async () => {
        const maintenance = await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: new Date('2024-12-31'),
            kmMaintenance: 50000,
            statut: 'planifiée'
        });

        const response = await request(app)
            .patch(`/api/maintenances/${maintenance._id}/effectuee`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                dateFait: '2024-01-15',
                kmMaintenance: 55000,
                cout: 500
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.statut).toBe('effectuée');
    });

    it('devrait retourner erreur si déjà effectuée', async () => {
        const maintenance = await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: new Date('2024-12-31'),
            dateFait: new Date('2024-01-15'),
            kmMaintenance: 55000,
            statut: 'effectuée'
        });

        const response = await request(app)
            .patch(`/api/maintenances/${maintenance._id}/effectuee`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                dateFait: '2024-01-20',
                kmMaintenance: 60000
            });

        expect(response.status).toBe(400);
    });
});

describe('PUT /api/maintenances/:id', () => {
    it('devrait modifier une maintenance', async () => {
        const maintenance = await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: new Date('2024-12-31'),
            kmMaintenance: 50000,
            statut: 'planifiée'
        });

        const response = await request(app)
            .put(`/api/maintenances/${maintenance._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                vehicule: testCamion._id.toString(),
                type: 'révision',
                datePrevu: '2024-12-31',
                kmMaintenance: 50000,
                cout: 1000
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.type).toBe('révision');
        expect(response.body.data.cout).toBe(1000);
    });

    it('devrait retourner 404 si maintenance n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/maintenances/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                vehicule: testCamion._id.toString(),
                type: 'vidange',
                datePrevu: '2024-12-31',
                kmMaintenance: 50000
            });

        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/maintenances/:id', () => {
    it('devrait supprimer une maintenance', async () => {
        const maintenance = await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: new Date('2024-12-31'),
            kmMaintenance: 50000,
            statut: 'planifiée'
        });

        const response = await request(app)
            .delete(`/api/maintenances/${maintenance._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const deleted = await Maintenance.findById(maintenance._id);
        expect(deleted).toBeNull();
    });

    it('devrait retourner 404 si maintenance n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/maintenances/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
    });
});

describe('GET /api/maintenances/alertes', () => {
    it('devrait retourner les maintenances en alerte', async () => {
        const datePassee = new Date();
        datePassee.setDate(datePassee.getDate() - 10);

        await Maintenance.create({
            vehicule: testCamion._id,
            type: 'vidange',
            datePrevu: datePassee,
            kmMaintenance: 50000,
            statut: 'planifiée'
        });

        const response = await request(app)
            .get('/api/maintenances/alertes')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBeGreaterThan(0);
    });
});

