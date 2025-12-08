require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API Truck Fleet Manager',
    database: mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'
  });
});


app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée' 
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;