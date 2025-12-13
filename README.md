# 🚛 Truck Fleet Manager

Système de gestion de flotte de camions complet avec interface d'administration et espace chauffeur.

## 📋 Table des matières

- [Description](#description)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies utilisées](#technologies-utilisées)
- [Diagramme UML](#diagramme-uml)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commandes Backend](#commandes-backend)
- [Commandes Frontend](#commandes-frontend)
- [Commandes Docker](#commandes-docker)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [API](#api)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [URLs de production](#urls-de-production)

## 📖 Description

Truck Fleet Manager est une application web complète pour la gestion d'une flotte de camions. Elle permet aux administrateurs de gérer les véhicules, les trajets, les maintenances, les pneus et les remorques, tandis que les chauffeurs peuvent consulter leurs trajets et mettre à jour leurs informations.

## ✨ Fonctionnalités

### 👨‍💼 Espace Administrateur
- **Gestion des utilisateurs** : Création, modification et activation/désactivation des comptes chauffeurs
- **Gestion des camions** : Ajout, modification, suivi du kilométrage et du statut
- **Gestion des remorques** : Suivi des remorques et de leur disponibilité
- **Gestion des pneus** : Suivi de l'état et de l'usure des pneus
- **Gestion des trajets** : Planification et suivi des trajets
- **Gestion des maintenances** : Planification et suivi des maintenances préventives et curatives
- **Tableau de bord** : Vue d'ensemble de la flotte avec statistiques

### 🚗 Espace Chauffeur
- **Tableau de bord personnel** : Vue d'ensemble des trajets assignés
- **Gestion des trajets** : Consultation et mise à jour des trajets
- **Profil** : Consultation des informations personnelles

### 🔐 Authentification
- Inscription avec validation par administrateur
- Connexion sécurisée avec JWT
- Gestion des rôles (admin/chauffeur)
- Protection des routes selon les permissions

## 🏗️ Architecture

Le projet suit une architecture **MERN Stack** (MongoDB, Express, React, Node.js) :

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Vite
│   (Port 4173)   │  Redux Toolkit pour l'état
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend       │  Node.js + Express
│   (Port 5000)   │  JWT Authentication
└────────┬────────┘
         │
         │ Mongoose ODM
         │
┌────────▼────────┐
│   MongoDB       │  Base de données NoSQL
│   (Port 27017)  │
└─────────────────┘
```

## 🛠️ Technologies utilisées

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **JWT** : Authentification par tokens
- **bcryptjs** : Hachage des mots de passe
- **express-validator** : Validation des données
- **PDFKit** : Génération de documents PDF
- **Jest** : Framework de tests

### Frontend
- **React 19** : Bibliothèque UI
- **TypeScript** : Typage statique
- **Vite** : Build tool et dev server
- **Redux Toolkit** : Gestion d'état
- **React Router** : Routage
- **Tailwind CSS** : Framework CSS
- **Radix UI** : Composants UI accessibles
- **Axios** : Client HTTP
- **Sonner** : Notifications toast

### DevOps
- **Docker** : Conteneurisation
- **Docker Compose** : Orchestration multi-conteneurs
- **Mongo Express** : Interface web pour MongoDB

## 📊 Diagramme UML

Pour voir le diagramme de cas d'utilisation complet du projet, consultez le fichier [UML_USE_CASE_DIAGRAM.md](./UML_USE_CASE_DIAGRAM.md).

## 📦 Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x ou **yarn**
- **MongoDB** >= 6.x (ou Docker)
- **Docker** et **Docker Compose** (optionnel, pour le déploiement)

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd truck-fleet-manager
```

### 2. Installation des dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Configuration de l'environnement

#### Backend
Créez un fichier `.env` dans le dossier `backend/` :

```env
# Serveur
NODE_ENV=development
PORT=5000

# Base de données
MONGODB_URI=mongodb://localhost:27017/truck_fleet

# JWT
JWT_SECRET=votre-secret-jwt-super-securise
JWT_EXPIRES_IN=7d

# CORS (optionnel)
CORS_ORIGIN=http://localhost:4173
```

#### Frontend
Créez un fichier `.env` dans le dossier `frontend/` :

```env
VITE_API_URL=http://localhost:5000
```

## ⚙️ Configuration

### Base de données MongoDB

#### Option 1 : MongoDB local
Assurez-vous que MongoDB est installé et démarré :
```bash
mongod
```

#### Option 2 : Docker Compose
```bash
docker-compose up -d mongodb
```

### Variables d'environnement importantes

- `MONGODB_URI` : URI de connexion MongoDB
- `JWT_SECRET` : Clé secrète pour signer les tokens JWT (changez-la en production !)
- `JWT_EXPIRES_IN` : Durée de validité des tokens (ex: `7d`, `24h`)
- `NODE_ENV` : Environnement (`development` ou `production`)

## 💻 Commandes Backend

Toutes les commandes doivent être exécutées depuis le dossier `backend/`.

### Installation et dépendances

```bash
# Installer les dépendances
npm install

# Installer une dépendance spécifique
npm install <package-name>

# Installer une dépendance de développement
npm install --save-dev <package-name>

# Mettre à jour les dépendances
npm update
```

### Développement

```bash
# Démarrer le serveur en mode développement (avec nodemon)
npm run dev

# Démarrer le serveur en mode production
npm start

# Vérifier les erreurs de syntaxe
node --check server.js
```

### Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests avec couverture de code
npm run test:coverage

# Lancer les tests en mode watch (surveillance continue)
npm run test:watch

# Lancer un fichier de test spécifique
npm test -- <nom-du-fichier>
```

### Base de données

```bash
# Se connecter à MongoDB (si installé localement)
mongosh mongodb://localhost:27017/truck_fleet

# Vérifier la connexion MongoDB
mongosh --eval "db.adminCommand('ping')"
```

### Nettoyage

```bash
# Supprimer node_modules
rm -rf node_modules

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json && npm install

# Nettoyer le cache npm
npm cache clean --force
```

## 💻 Commandes Frontend

Toutes les commandes doivent être exécutées depuis le dossier `frontend/`.

### Installation et dépendances

```bash
# Installer les dépendances
npm install

# Installer une dépendance spécifique
npm install <package-name>

# Installer une dépendance de développement
npm install --save-dev <package-name>

# Mettre à jour les dépendances
npm update
```

### Développement

```bash
# Démarrer le serveur de développement (Vite)
npm run dev

# Démarrer avec un port spécifique
npm run dev -- --port 3000

# Démarrer avec un host spécifique
npm run dev -- --host 0.0.0.0
```

### Build et Production

```bash
# Build de production
npm run build

# Build avec analyse du bundle
npm run build -- --analyze

# Prévisualiser le build de production
npm run preview

# Prévisualiser sur un port spécifique
npm run preview -- --port 4174
```

### Linting et Formatage

```bash
# Lancer ESLint
npm run lint

# Lancer ESLint avec auto-fix
npm run lint -- --fix

# Vérifier les types TypeScript
npx tsc --noEmit
```

### Nettoyage

```bash
# Supprimer node_modules
rm -rf node_modules

# Supprimer node_modules et dist
rm -rf node_modules dist package-lock.json && npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer le cache Vite
rm -rf node_modules/.vite
```

## 🐳 Commandes Docker

### Docker Compose (Recommandé)

```bash
# Démarrer tous les services (MongoDB, Backend, Frontend)
docker-compose up

# Démarrer en arrière-plan (détaché)
docker-compose up -d

# Démarrer uniquement MongoDB
docker-compose up -d mongodb

# Démarrer uniquement le backend
docker-compose up -d backend

# Démarrer uniquement le frontend
docker-compose up -d frontend

# Démarrer MongoDB et Mongo Express
docker-compose up -d mongodb mongo-express

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Voir les logs de tous les services
docker-compose logs

# Voir les logs d'un service spécifique
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Suivre les logs en temps réel
docker-compose logs -f

# Reconstruire les images
docker-compose build

# Reconstruire sans cache
docker-compose build --no-cache

# Reconstruire et redémarrer
docker-compose up -d --build

# Voir le statut des services
docker-compose ps

# Redémarrer un service spécifique
docker-compose restart backend
docker-compose restart frontend

# Arrêter un service spécifique
docker-compose stop backend

# Démarrer un service arrêté
docker-compose start backend
```

### Docker (Commandes individuelles)

#### Backend

```bash
# Se placer dans le dossier backend
cd backend

# Build de l'image backend
docker build -t truck-fleet-backend .

# Build avec un tag spécifique
docker build -t truck-fleet-backend:v1.0.0 .

# Build sans cache
docker build --no-cache -t truck-fleet-backend .

# Lancer le conteneur backend
docker run -d \
  --name truck-fleet-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGODB_URI=mongodb://admin:password123@mongodb:27017/truck_fleet?authSource=admin \
  -e JWT_SECRET=your-secret-jwt-key \
  truck-fleet-backend

# Lancer avec un fichier .env
docker run -d \
  --name truck-fleet-backend \
  -p 5000:5000 \
  --env-file .env \
  truck-fleet-backend

# Voir les logs du backend
docker logs truck-fleet-backend

# Suivre les logs en temps réel
docker logs -f truck-fleet-backend

# Arrêter le conteneur
docker stop truck-fleet-backend

# Démarrer le conteneur
docker start truck-fleet-backend

# Redémarrer le conteneur
docker restart truck-fleet-backend

# Supprimer le conteneur
docker rm truck-fleet-backend

# Supprimer l'image
docker rmi truck-fleet-backend
```

#### Frontend

```bash
# Se placer dans le dossier frontend
cd frontend

# Build de l'image frontend
docker build -t truck-fleet-frontend .

# Build avec un tag spécifique
docker build -t truck-fleet-frontend:v1.0.0 .

# Build sans cache
docker build --no-cache -t truck-fleet-frontend .

# Lancer le conteneur frontend
docker run -d \
  --name truck-fleet-frontend \
  -p 4173:4173 \
  truck-fleet-frontend

# Voir les logs du frontend
docker logs truck-fleet-frontend

# Suivre les logs en temps réel
docker logs -f truck-fleet-frontend

# Arrêter le conteneur
docker stop truck-fleet-frontend

# Démarrer le conteneur
docker start truck-fleet-frontend

# Redémarrer le conteneur
docker restart truck-fleet-frontend

# Supprimer le conteneur
docker rm truck-fleet-frontend

# Supprimer l'image
docker rmi truck-fleet-frontend
```

#### MongoDB

```bash
# Lancer MongoDB avec Docker
docker run -d \
  --name truck-fleet-mongodb \
  -p 27018:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=truck_fleet \
  -v mongodb_data:/data/db \
  mongo:latest

# Se connecter à MongoDB dans le conteneur
docker exec -it truck-fleet-mongodb mongosh -u admin -p password123

# Voir les logs MongoDB
docker logs truck-fleet-mongodb

# Arrêter MongoDB
docker stop truck-fleet-mongodb

# Démarrer MongoDB
docker start truck-fleet-mongodb

# Supprimer le conteneur MongoDB (⚠️ les données seront perdues sauf si volume)
docker rm truck-fleet-mongodb
```

#### Mongo Express (Interface web MongoDB)

```bash
# Lancer Mongo Express
docker run -d \
  --name truck-fleet-mongo-express \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=password123 \
  -e ME_CONFIG_MONGODB_URL=mongodb://admin:password123@mongodb:27017/ \
  --link truck-fleet-mongodb:mongodb \
  mongo-express:latest

# Accéder à Mongo Express
# Ouvrir http://localhost:8081 dans le navigateur
```

### Commandes Docker générales

```bash
# Lister tous les conteneurs
docker ps -a

# Lister les conteneurs en cours d'exécution
docker ps

# Lister toutes les images
docker images

# Voir l'utilisation des ressources
docker stats

# Nettoyer les conteneurs arrêtés
docker container prune

# Nettoyer les images non utilisées
docker image prune

# Nettoyer tout (conteneurs, images, volumes, réseaux)
docker system prune -a --volumes

# Voir les volumes
docker volume ls

# Supprimer un volume
docker volume rm mongodb_data

# Voir les réseaux
docker network ls

# Inspecter un conteneur
docker inspect truck-fleet-backend

# Exécuter une commande dans un conteneur
docker exec -it truck-fleet-backend sh
docker exec -it truck-fleet-backend /bin/bash

# Copier un fichier depuis le conteneur
docker cp truck-fleet-backend:/app/file.txt ./file.txt

# Copier un fichier vers le conteneur
docker cp ./file.txt truck-fleet-backend:/app/file.txt
```

### Déploiement Azure (Backend)

```bash
# Utiliser le script de déploiement
./deploy-backend.sh

# Ou manuellement :

# Build de l'image pour Azure Container Registry
docker build -t truckfleetacr.azurecr.io/truck-fleet-backend:latest ./backend

# Push vers Azure Container Registry
docker push truckfleetacr.azurecr.io/truck-fleet-backend:latest

# Se connecter à Azure Container Registry
az acr login --name truckfleetacr
```

## 💻 Utilisation

### Développement

#### Démarrer le backend
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:5000`

#### Démarrer le frontend
```bash
cd frontend
npm run dev
```
L'application démarre sur `http://localhost:5173`

### Production

#### Avec Docker Compose
```bash
docker-compose up -d
```

Cela démarre :
- MongoDB sur le port `27018`
- Mongo Express sur le port `8081`
- Backend sur le port `5000`
- Frontend sur le port `4173`

#### Build manuel

**Backend :**
```bash
cd backend
npm start
```

**Frontend :**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Structure du projet

```
truck-fleet-manager/
├── backend/
│   ├── config/           # Configuration (base de données)
│   ├── controllers/      # Contrôleurs (logique métier)
│   ├── middlewares/      # Middlewares (auth, validation, erreurs)
│   ├── models/           # Modèles Mongoose
│   ├── routes/           # Routes API
│   ├── services/         # Services (PDF, etc.)
│   ├── __tests__/        # Tests unitaires et d'intégration
│   ├── server.js         # Point d'entrée
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Composants React
│   │   │   ├── admin/    # Composants admin
│   │   │   ├── chauffeur/# Composants chauffeur
│   │   │   └── ui/       # Composants UI réutilisables
│   │   ├── layouts/      # Layouts (Admin, Chauffeur)
│   │   ├── pages/        # Pages de l'application
│   │   ├── redux/        # Store Redux et slices
│   │   ├── routes/       # Configuration des routes
│   │   ├── services/     # Services API
│   │   └── utils/        # Utilitaires
│   ├── public/           # Assets statiques
│   └── package.json
│
├── docker-compose.yml    # Configuration Docker
└── README.md
```

## 🔌 API

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Informations utilisateur connecté

#### Camions
- `GET /api/camions` - Liste des camions
- `POST /api/camions` - Créer un camion
- `GET /api/camions/:id` - Détails d'un camion
- `PUT /api/camions/:id` - Modifier un camion
- `DELETE /api/camions/:id` - Supprimer un camion

#### Remorques
- `GET /api/remorques` - Liste des remorques
- `POST /api/remorques` - Créer une remorque
- `GET /api/remorques/:id` - Détails d'une remorque
- `PUT /api/remorques/:id` - Modifier une remorque
- `DELETE /api/remorques/:id` - Supprimer une remorque

#### Pneus
- `GET /api/pneus` - Liste des pneus
- `POST /api/pneus` - Créer un pneu
- `GET /api/pneus/:id` - Détails d'un pneu
- `PUT /api/pneus/:id` - Modifier un pneu
- `DELETE /api/pneus/:id` - Supprimer un pneu

#### Trajets
- `GET /api/trajets` - Liste des trajets
- `POST /api/trajets` - Créer un trajet
- `GET /api/trajets/:id` - Détails d'un trajet
- `PUT /api/trajets/:id` - Modifier un trajet
- `DELETE /api/trajets/:id` - Supprimer un trajet

#### Maintenances
- `GET /api/maintenances` - Liste des maintenances
- `POST /api/maintenances` - Créer une maintenance
- `GET /api/maintenances/:id` - Détails d'une maintenance
- `PUT /api/maintenances/:id` - Modifier une maintenance
- `DELETE /api/maintenances/:id` - Supprimer une maintenance

#### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (admin uniquement)
- `PUT /api/users/:id/activate` - Activer un utilisateur
- `PUT /api/users/:id/deactivate` - Désactiver un utilisateur

### Authentification

Toutes les routes (sauf `/api/auth/register` et `/api/auth/login`) nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

## 🧪 Tests

### Backend

```bash
cd backend

# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Mode watch
npm run test:watch
```

Les tests utilisent :
- **Jest** : Framework de tests
- **Supertest** : Tests d'API
- **mongodb-memory-server** : Base de données en mémoire pour les tests

## 🚢 Déploiement

### Backend (Azure Container Apps)

Le backend est déployé sur Azure Container Apps. Utilisez le script de déploiement :

```bash
# Depuis la racine du projet
./deploy-backend.sh

# Ou manuellement :
cd backend
docker build -t truckfleetacr.azurecr.io/truck-fleet-backend:latest .
docker push truckfleetacr.azurecr.io/truck-fleet-backend:latest
```

### Frontend (Vercel)

Le frontend est déployé sur Vercel. La configuration est dans `frontend/vercel.json`.

Pour déployer sur Vercel :

```bash
# Installer Vercel CLI
npm i -g vercel

# Se placer dans le dossier frontend
cd frontend

# Déployer
vercel

# Déployer en production
vercel --prod
```

## 🌐 URLs de production

- **Frontend** : https://truck-fleet-manager.vercel.app/
- **Backend API** : https://truck-fleet-backend.gentlesmoke-61024e48.swedencentral.azurecontainerapps.io/

## 📝 Modèles de données

### User (Utilisateur)
- `role` : `admin` | `chauffeur`
- `email` : Email unique
- `password` : Mot de passe haché
- `nom` : Nom
- `prenom` : Prénom
- `isActive` : Statut d'activation

### Camion
- `matricule` : Matricule unique
- `marque` : Marque du camion
- `modele` : Modèle
- `annee` : Année de fabrication
- `kilometrage` : Kilométrage actuel
- `statut` : `disponible` | `en mission` | `en panne` | `en maintenance`
- `derniereMaintenanceKm` : Kilométrage de la dernière maintenance

### Remorque
- `matricule` : Matricule unique
- `type` : Type de remorque
- `capacite` : Capacité en tonnes
- `statut` : Statut de disponibilité

### Trajet
- `chauffeur` : Référence au chauffeur
- `camion` : Référence au camion
- `remorque` : Référence à la remorque (optionnel)
- `dateDepart` / `dateArrivee` : Dates du trajet
- `lieuDepart` / `lieuArrivee` : Lieux
- `kmDepart` / `kmArrivee` : Kilométrages
- `gasoilConsomme` : Consommation de carburant
- `statut` : `à faire` | `en cours` | `terminé` | `annulé`

### Maintenance
- `type` : Type de maintenance
- `vehicule` : Référence au camion
- `datePrevu` / `dateFait` : Dates
- `kmMaintenance` : Kilométrage au moment de la maintenance
- `cout` : Coût de la maintenance
- `statut` : `planifiée` | `en cours` | `effectuée` | `reportée`

## 🔒 Sécurité

- Mots de passe hachés avec bcrypt
- Authentification JWT
- Validation des données d'entrée
- Protection CORS configurée
- Blacklist des tokens déconnexion
- Routes protégées selon les rôles

## 📄 Licence

ISC


---

## 🔗 Liens utiles

- **Frontend en production** : https://truck-fleet-manager.vercel.app/
- **Backend API en production** : https://truck-fleet-backend.gentlesmoke-61024e48.swedencentral.azurecontainerapps.io/
- **Diagramme UML** : [UML_USE_CASE_DIAGRAM.md](./UML_USE_CASE_DIAGRAM.md)

---

Pour toute question ou problème, veuillez ouvrir une issue sur le dépôt.
