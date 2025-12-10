const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const trajetRoutes = require('../routes/trajet.routes');
const { errorHandler } = require('../middlewares/errorHandler.middleware');
const User = require('../models/User.model');
const Camion = require('../models/Camion.model');
const Remorque = require('../models/Remorque.model');
const Trajet = require('../models/Trajet.model');

const app = express();
app.use(express.json());
app.use('/api/trajets', trajetRoutes);
app.use(errorHandler);

let adminToken;
let chauffeurToken;
let chauffeurId;
let camionId;
let remorqueId;

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    console.log('✅ Connecté à test DB');
});

afterAll(async () => {
    await mongoose.connection.close();
    console.log('✅ Déconnecté de test DB');
});

beforeEach(async () => {
    await Trajet.deleteMany({});
    await User.deleteMany({});
    await Camion.deleteMany({});
    await Remorque.deleteMany({});
    
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

    chauffeurId = chauffeur._id;

    const camion = await Camion.create({
        matricule: 'CAM-TEST',
        marque: 'Mercedes',
        modele: 'Actros',
        annee: 2023,
        kilometrage: 50000
    });

    camionId = camion._id;

    const remorque = await Remorque.create({
        matricule: 'REM-TEST',
        type: 'frigorifique',
        capacite: 25
    });

    remorqueId = remorque._id;

    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    chauffeurToken = jwt.sign({ id: chauffeur._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
});

// ==================== TESTS ====================

describe('GET /api/trajets', () => {

    it('devrait retourner tous les trajets (admin)', async () => {
        await Trajet.create({
            chauffeur: chauffeurId,
            camion: camionId,
            remorque: remorqueId,
            dateDepart: new Date('2025-01-01'),
            dateArrivee: new Date('2025-01-02'),
            lieuDepart: 'Casablanca',
            lieuArrivee: 'Marrakech',
            statut: 'à faire'
        });

        await Trajet.create({
            chauffeur: chauffeurId,
            camion: camionId,
            remorque: remorqueId,
            dateDepart: new Date('2025-01-03'),
            dateArrivee: new Date('2025-01-04'),
            lieuDepart: 'Rabat',
            lieuArrivee: 'Tanger',
            statut: 'en cours'
        });

        const response = await request(app)
            .get('/api/trajets')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
    });

    it('devrait retourner 401 si pas de token', async () => {
        const response = await request(app)
            .get('/api/trajets');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe('POST /api/trajets', () => {

    it('devrait créer un nouveau trajet (admin)', async () => {
        const trajetData = {
            chauffeur: chauffeurId.toString(),
            camion: camionId.toString(),
            remorque: remorqueId.toString(),
            dateDepart: '2025-01-15',
            dateArrivee: '2025-01-16',
            lieuDepart: 'Casablanca',
            lieuArrivee: 'Agadir',
            description: 'Transport de marchandises'
        };

        const response = await request(app)
            .post('/api/trajets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(trajetData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.lieuDepart).toBe('Casablanca');
        expect(response.body.data.statut).toBe('à faire');
    });

    it('devrait retourner erreur si données manquantes', async () => {
        const response = await request(app)
            .post('/api/trajets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                chauffeur: chauffeurId.toString(),
                lieuDepart: 'Casablanca'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('devrait retourner 403 si chauffeur essaye de créer', async () => {
        const response = await request(app)
            .post('/api/trajets')
            .set('Authorization', `Bearer ${chauffeurToken}`)
            .send({
                chauffeur: chauffeurId.toString(),
                camion: camionId.toString(),
                remorque: remorqueId.toString(),
                dateDepart: '2025-01-15',
                dateArrivee: '2025-01-16',
                lieuDepart: 'Casablanca',
                lieuArrivee: 'Agadir'
            });

        expect(response.status).toBe(403);
    });
});

describe('GET /api/trajets/:id', () => {

    it('devrait retourner un trajet par ID (admin)', async () => {
        const trajet = await Trajet.create({
            chauffeur: chauffeurId,
            camion: camionId,
            remorque: remorqueId,
            dateDepart: new Date('2025-01-01'),
            dateArrivee: new Date('2025-01-02'),
            lieuDepart: 'Casablanca',
            lieuArrivee: 'Marrakech'
        });

        const response = await request(app)
            .get(`/api/trajets/${trajet._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.lieuDepart).toBe('Casablanca');
    });

    it('devrait retourner 404 si trajet n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/trajets/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});

describe('PUT /api/trajets/:id', () => {

    it('devrait modifier un trajet (admin)', async () => {
        const trajet = await Trajet.create({
            chauffeur: chauffeurId,
            camion: camionId,
            remorque: remorqueId,
            dateDepart: new Date('2025-01-01'),
            dateArrivee: new Date('2025-01-02'),
            lieuDepart: 'Casablanca',
            lieuArrivee: 'Marrakech',
            statut: 'à faire'
        });

        const response = await request(app)
            .put(`/api/trajets/${trajet._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                chauffeur: chauffeurId.toString(),
                camion: camionId.toString(),
                remorque: remorqueId.toString(),
                dateDepart: '2025-01-05',
                dateArrivee: '2025-01-06',
                lieuDepart: 'Casablanca',
                lieuArrivee: 'Fes',
                statut: 'à faire'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.lieuArrivee).toBe('Fes');
    });

    it('devrait retourner 404 si trajet n\'existe pas', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/trajets/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                chauffeur: chauffeurId.toString(),
                camion: camionId.toString(),
                remorque: remorqueId.toString(),
                dateDepart: '2025-01-01',
                dateArrivee: '2025-01-02',
                lieuDepart: 'Test',
                lieuArrivee: 'Test'
            });

        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/trajets/:id', () => {

    it('devrait supprimer un trajet (admin)', async () => {
        const trajet = await Trajet.create({
            chauffeur: chauffeurId,
            camion: camionId,
            remorque: remorqueId,
            dateDepart: new Date('2025-01-01'),
            dateArrivee: new Date('2025-01-02'),
            lieuDepart: 'Casablanca',
            lieuArrivee: 'Marrakech'
        });

        const response = await request(app)
            .delete(`/api/trajets/${trajet._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const deleted = await Trajet.findById(trajet._id);
        expect(deleted).toBeNull();
    });

    it('devrait retourner 403 si chauffeur essaye', async () => {
        const trajet = await Trajet.create({
            chauffeur: chauffeurId,
            camion: camionId,
            remorque: remorqueId,
            dateDepart: new Date('2025-01-01'),
            dateArrivee: new Date('2025-01-02'),
            lieuDepart: 'Casablanca',
            lieuArrivee: 'Marrakech'
        });

        const response = await request(app)
            .delete(`/api/trajets/${trajet._id}`)
            .set('Authorization', `Bearer ${chauffeurToken}`);

        expect(response.status).toBe(403);
    });
});

describe('PATCH /api/trajets/:id/statut', () => {

    it('devrait changer le statut en "en cours" (chauffeur)', async () => {
        const trajet = await Trajet.create({
            chauffeur: chauffeurId,
            camion: camionId,
            remorque: remorqueId,
            dateDepart: new Date('2025-01-01'),
            dateArrivee: new Date('2025-01-02'),
            lieuDepart: 'Casablanca',
            lieuArrivee: 'Marrakech',
            statut: 'à faire'
        });

        const response = await request(app)
            .patch(`/api/trajets/${trajet._id}/statut`)
            .set('Authorization', `Bearer ${chauffeurToken}`)
            .send({ statut: 'en cours' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.statut).toBe('en cours');
    });

    

    it('devrait retourner erreur si statut invalide', async () => {
        const trajet = await Trajet.create({
            chauffeur: chauffeurId,
            camion: camionId,
            remorque: remorqueId,
            dateDepart: new Date('2025-01-01'),
            dateArrivee: new Date('2025-01-02'),
            lieuDepart: 'Casablanca',
            lieuArrivee: 'Marrakech',
            statut: 'à faire'
        });

        const response = await request(app)
            .patch(`/api/trajets/${trajet._id}/statut`)
            .set('Authorization', `Bearer ${chauffeurToken}`)
            .send({ statut: 'invalid_status' });

        expect(response.status).toBe(400);
    });
});

describe('GET /api/trajets/chauffeur/mes-trajets', () => {



    it('devrait retourner 401 si pas de token', async () => {
        const response = await request(app)
            .get('/api/trajets/chauffeur/mes-trajets');

        expect(response.status).toBe(401);
    });
});
