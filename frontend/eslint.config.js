import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "no-unused-vars": ["warn", { 
        "varsIgnorePattern": "^(React|error|err|e|res|req|next|_)$",
        "argsIgnorePattern": "^(error|err|e|res|req|next|_|user|product)$"
      }],
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",
      // These React Compiler-oriented rules can't yet reliably tell event
      // handlers apart from render bodies, so they false-positive on normal
      // patterns like `window.location.href = url` or `Date.now()` inside
      // onClick/onSubmit handlers. Downgrade to warnings until that improves.
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn"
    }
  },
  {
    files: ['process-favicon.js', 'scripts/**/*.{js,cjs}', 'vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Context files intentionally co-locate a provider component with its
    // `useX()` hook, which trips the fast-refresh-only-exports-components
    // rule. That only affects Vite's hot-reload granularity, not correctness.
    files: ['src/context/**/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'warn',
    },
  },
])
