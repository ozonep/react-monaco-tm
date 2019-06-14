const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin-updated');
const path = require('path');
const WorkerPlugin = require('worker-plugin');


module.exports = {
  entry: './app.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    globalObject: 'self',
    path: path.resolve(__dirname, 'dist'),
    // path: path.join(__dirname, './lib/t'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['file?name=[name].[ext]'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ],
  },
  plugins: [
    new MonacoWebpackPlugin(),
    new WorkerPlugin(),
  ],
  devServer: { contentBase: './' },
  node: {
    fs: 'empty'
  }
};
