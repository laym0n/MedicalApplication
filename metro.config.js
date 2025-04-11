const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    extraNodeModules: {
        '@': path.resolve(__dirname, 'src'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@app': path.resolve(__dirname, 'src/app'),
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
