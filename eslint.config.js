import globals from 'globals'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {},
    rules: {
      'no-unused-vars': 'off',
      // All log output must go through src/utils/logger.ts (which is the single
      // sanctioned console sink, self-exempted via an inline disable directive).
      'no-console': 'error',
    },
  },
  {
    // Service-worker templates are shipped verbatim and legitimately use
    // `console` in the worker context — they are not part of the linted source.
    ignores: [
      'dist',
      'build',
      'node_modules',
      '*.config.js',
      '*.config.ts',
      'src/templates/**',
    ],
  },
]
