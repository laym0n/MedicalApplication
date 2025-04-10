module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@src': './src/',
          '@pages': './src/pages',
          '@components': './src/components', // можно добавить и другие алиасы
        },
      },
    ],
  ],
};
