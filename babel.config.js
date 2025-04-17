module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'babel-plugin-transform-typescript-metadata',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@src': './src/',
          '@pages': './src/pages',
          '@shared': './src/shared',
          '@widget': './src/widget',
          '@feature': './src/feature',
          '@app': './src/app',
          '@components': './src/components',
        },
      },
    ],
  ],
};
