const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env) => ({
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CopyPlugin([
      { context: 'public', from: '**/*' }
    ])
  ]
});
