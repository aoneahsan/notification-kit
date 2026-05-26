import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import {
  readFileSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
} from 'node:fs'

// Single-source the published version from package.json (injected via `define`
// below) so the runtime `version` export can never drift from the package.
const pkgVersion = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
).version as string

/**
 * Copy the service-worker templates into `dist/templates` so they actually ship
 * in the package and can be deployed by the `notification-kit-setup` CLI.
 */
function copyServiceWorkerTemplates() {
  return {
    name: 'notification-kit-copy-sw-templates',
    closeBundle() {
      const srcDir = resolve(__dirname, 'src/templates')
      const outDir = resolve(__dirname, 'dist/templates')
      mkdirSync(outDir, { recursive: true })
      for (const file of readdirSync(srcDir)) {
        copyFileSync(resolve(srcDir, file), resolve(outDir, file))
      }
    },
  }
}

export default defineConfig({
  define: {
    __NOTIFICATION_KIT_VERSION__: JSON.stringify(pkgVersion),
  },
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.test.*', '**/*.spec.*', 'src/test/**'],
      insertTypesEntry: true,
      rollupTypes: false,
      tsconfigPath: './tsconfig.build.json',
      // Keep the ambient stubs in src/types/external.d.ts in the dts PROGRAM so
      // the optional-peer module imports resolve during type generation, but do
      // NOT copy that hand-written .d.ts into the output — shipping it would
      // clash with a consumer's real firebase / react-onesignal / @capacitor
      // types. copyDtsFiles:false ensures it (and other src .d.ts) aren't copied.
      copyDtsFiles: false,
      staticImport: true,
      logDiagnostics: true,
    }),
    copyServiceWorkerTemplates(),
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
      // Ship both ESM (import) and CJS (require) builds.
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        format === 'cjs' ? `${entryName}.cjs` : `${entryName}.esm.js`,
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
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'info',
})
