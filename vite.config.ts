//vite.config.ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    test: {
        testTimeout: 20000,
        environment: 'node',
        globals: true,

        globalSetup: './src/config/global-setup.ts',
        // setupFiles: ['./src/config/test-setup.ts'],
    },
    plugins: [swc.vite()],
});