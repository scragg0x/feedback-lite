const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const webpack = require('webpack');

const PROD = (process.env.NODE_ENV === 'production');

const plugins = [
  new ExtractTextPlugin(PROD ? 'feedback.min.css' : 'feedback.css'),
];

if (PROD) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      screw_ie8: true,
      warnings: false,
    },
    mangle: {
      screw_ie8: true,
    },
    output: {
      comments: false,
      screw_ie8: true,
    },
  }));
}

module.exports = {
  entry: {
    app: ['./src/feedback.js']
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/assets/",
    filename: PROD ? 'feedback.min.js' : 'feedback.js',
    library: 'Feedback',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style", "css!sass"),
      }
    ]
  },
  plugins,
};
