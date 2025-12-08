const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        };
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`✅ MongoDB connecté avec succès: ${conn.connection.host}`);
        console.log(`📊 Base de données: ${conn.connection.name}`);

        return conn
    }

    catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error.message);

        if (process.env.NODE_ENV === 'development') {
            console.error('Détails de l\'erreur:', error);
        }

        process.exit(1);


    }
};
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connecté à MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('❌ Erreur Mongoose:', err.message);
});
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose déconnecté de MongoDB');
});

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('🔴 Connexion MongoDB fermée suite à l\'arrêt de l\'application');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la fermeture:', err);
        process.exit(1);
    }
});

module.exports = connectDB;