import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginJest from 'eslint-plugin-jest'
import pluginJestDom from 'eslint-plugin-jest-dom'
import pluginTestingLibrary from 'eslint-plugin-testing-library'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['src/**/*.{js,ts,mjs,jsx,tsx}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginPrettierRecommended,
  {
    files: ['src/**/*.test.{js,ts,jsx,tsx}'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
  {
    files: ['src/**/*.test.{js,ts,jsx,tsx}'],
    ...pluginJestDom.configs['flat/recommended'],
    ...pluginTestingLibrary.configs['flat/react'],
  },
]
