/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import validate from 'webpack-validator';
import StringReplacePlugin from 'string-replace-webpack-plugin';
import {
  dependencies as externals
} from './app/package.json';

export default validate({
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.js$/,
      loader: StringReplacePlugin.replace({
        replacements: [
          {
            pattern: /#! \/usr\/bin\/env node/ig,
            replacement: function (match, p1, offset, string) {
              console.error('Replacing');
              return '';
            }
          }
        ] })
    }]
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js',

    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins: [
    new StringReplacePlugin()
  ],

  externals: Object.keys(externals || {})
});
