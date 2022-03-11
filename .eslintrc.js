module.exports = {
  extends: ['@valora/eslint-config-typescript'],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'no-console': ['error', { allow: ['none'] }]
  }
}
