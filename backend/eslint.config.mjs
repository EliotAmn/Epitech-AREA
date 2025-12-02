// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// collect rules from the type-checked recommended config so we can spread them
const tsTypeCheckedRules = Object.assign(
  {},
  ...tseslint.configs.recommendedTypeChecked.map((cfg) => cfg.rules || {})
);

export default [
  // global ignores
  {
    ignores: [
      'dist/',
      'coverage/',
      'test/locust',
      'node_modules/',
      '.eslintrc.js',
      'eslint.config.*',
    ],
  },

  // basic JS recommendations
  js.configs.recommended,

  // TypeScript files (type-checked rules)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      globals: { ...globals.node },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      ...tsTypeCheckedRules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      ...prettier.rules,
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['src/*', '*/src'],
              message: 'Use @/ instead of src/ for imports',
            },
            {
              group: ['../../*'],
              message: 'Use @/ instead of relative imports',
            },
          ],
        },
      ],
    },
  },

  // Test files: relax some rules for tests
  {
    files: ['**/*.spec.ts', '**/*.test.ts', 'test/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.jest },
    },
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
];
