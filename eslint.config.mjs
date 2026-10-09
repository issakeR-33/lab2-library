import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // за завданням Validation оформлено як namespace всередині модуля
      '@typescript-eslint/no-namespace': 'off',
      'no-console': 'warn',
      eqeqeq: 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: { globals: globals.mocha },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { globals: globals.node, sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: { sourceType: 'module' },
  },
  prettier,
);
