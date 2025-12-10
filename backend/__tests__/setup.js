const { MongoMemoryServer } = require('mongodb-memory-server');


module.exports = async () => {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    global.__MONGOSERVER__ = mongoServer;
    global.__MONGO_URI__ = mongoUri;
    process.env.MONGO_URI = mongoUri;

    console.log('✅ MongoDB Memory Server démarré:', mongoUri);
};