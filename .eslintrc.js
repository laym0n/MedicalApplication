module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'import/order': ['off'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_', // игнорировать переменные, начинающиеся с _
        argsIgnorePattern: '^_', // игнорировать аргументы, начинающиеся с _
      },
    ],
  },
};
