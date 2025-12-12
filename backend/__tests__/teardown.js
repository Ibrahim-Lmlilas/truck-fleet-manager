module.exports = async () => {
  if (global.__MONGOSERVER__) {
    await global.__MONGOSERVER__.stop();
    console.log('✅ MongoDB Memory Server arrêté');
  }
};