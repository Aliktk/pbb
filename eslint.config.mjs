import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

// Single flat config for the whole monorepo. TypeScript-focused (syntactic, no type-aware
// rules — those are covered by `pnpm typecheck`). Next.js React specifics are covered by
// `next build`. Run with `pnpm lint`.
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '_handoff/**',
      '**/*.d.ts',
      'apps/api/prisma/migrations/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off', // used deliberately after guards
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Scripts and seeds may log to the console.
    files: ['scripts/**', 'apps/api/prisma/seed.ts'],
    rules: { 'no-console': 'off' },
  },
);
