require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const camionRoutes = require('./routes/camion.routes');
const remorqueRoutes = require('./routes/remorque.routes');
const pneuRoutes = require('./routes/pneu.routes');
const trajetRoutes = require('./routes/trajet.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const userRoutes = require('./routes/user.routes');

const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');



const app = express();

connectDB();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API Truck Fleet Manager',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/camions', camionRoutes);
app.use('/api/remorques', remorqueRoutes);
app.use('/api/pneus', pneuRoutes);
app.use('/api/trajets', trajetRoutes);
app.use('/api/maintenances', maintenanceRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// ========== DÉMARRAGE SERVEUR ==========
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`${'='.repeat(50)}\n`);
});

// Gestion arrêt propre
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;