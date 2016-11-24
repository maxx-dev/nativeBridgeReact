var path = require('path');
var webpack = require('webpack');

const babelSettings = {
  extends: path.join(__dirname, '/.babelrc')
}

module.exports = {

  context: process.cwd() + '/../client',
  devtool:'source-map',
  entry: {
    reload:'../devServer/node_modules/webpack-hot-middleware/client',
    main:'./index'
  },
  output: {
    path: './build/',
    filename: "build/[name].bundle.js"
  },

  resolve: {
    alias:{
      'react': path.resolve("./node_modules/react"),
      'react-dom': path.resolve("./node_modules/react-dom"),
      'react-redux': path.resolve("./node_modules/react-redux"),
      'redux': path.resolve("./node_modules/redux"),
      'babel-polyfill': path.resolve("./node_modules/babel-polyfill")
    }
  },

  resolveLoader: {
    modulesDirectories: [
      path.resolve('./node_modules')
    ]
  },

  devServer: {
    contentBase:path.resolve('../client'),
    stats: 'errors-only'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel?' + JSON.stringify(babelSettings), // workaround to get babel working above directory ob this config file
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/,
        loader: "file" // serves css files
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
     'process.env': {
     'NODE_ENV': '"production"'
     }
     }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
}
