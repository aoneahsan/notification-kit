import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    // eslint-plugin-react-hooks v7 ships its recommended config with a
    // legacy array `plugins` shape that ESLint 10 flat config rejects, so
    // register the plugin explicitly and spread only its rules.
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
    },
  },
])
