import {defineConfig} from 'vitest/config'

export default defineConfig({


    test: {
        name: 'node',
        root: './',
        environment: 'node',
        setupFiles: ['./test/globalSetup.js'],
        testTimeout: 60000,
    },
    build: {
        sourcemap: true, // Enable source maps for better debugging
    },

})