module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'models/**/*.js'
  ],

  globalSetup: './__tests__/setup.js',
  globalTeardown: './__tests__/teardown.js',
  testTimeout: 30000
};