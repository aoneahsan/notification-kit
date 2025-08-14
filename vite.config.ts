import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.test.*', '**/*.spec.*'],
      insertTypesEntry: true,
      rollupTypes: false,
      tsconfigPath: './tsconfig.build.json',
      copyDtsFiles: true,
      staticImport: true,
      skipDiagnostics: false,
      logDiagnostics: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './src/core'),
      '@/providers': resolve(__dirname, './src/providers'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/react': resolve(__dirname, './src/react'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/react/index.ts'),
      },
      name: 'NotificationKit',
      formats: ['es'],
      fileName: (format, entryName) => {
        return `${entryName}.esm.js`
      },
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@capacitor/core',
        '@capacitor/push-notifications',
        '@capacitor/local-notifications',
        '@capacitor/preferences',
        'firebase',
        'firebase/app',
        'firebase/messaging',
        'firebase/messaging/sw',
        'react-onesignal',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})