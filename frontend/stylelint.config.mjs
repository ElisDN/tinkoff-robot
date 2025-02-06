/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-scss', 'stylelint-prettier/recommended'],
  plugins: ['stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
    'selector-class-pattern': '^(([a-z][a-zA-Z0-9]+)|(([a-z][a-z0-9]*)(-[a-z0-9]+)*))$',
    'no-invalid-position-at-import-rule': null,
    'import-notation': 'string',
  },
}
