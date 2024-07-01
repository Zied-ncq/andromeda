module.exports = {
    testTimeout: 60000,
    verbose: true,
    // setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    globalSetup: '<rootDir>/test/jestGlobalSetup.cjs',
    moduleFileExtensions: ['js', 'json'],
    rootDir: '.',
    testEnvironment: 'node',
    coverageDirectory: '<rootDir>/coverage/unit',

};