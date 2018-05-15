const webpack = require('webpack');
const isProd = process.env.NODE_ENV === "production";
const pkg = require('./package.json');
const path = require("path")

const config = {
  entry: {
    app: './app.jsx',
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../public/js'),
    chunkFilename: '[name]-[chunkhash].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
        presets: ['@babel/preset-env', '@babel/preset-react']
        }

      }
    ]
  }
};
if (isProd) {
  config.module.rules = [
     {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            "presets": [
              ["@babel/preset-env", {
                "targets": {
                  "browsers": ["last 2 versions", "safari >= 7"]
                }
              }]
            ]
          }
        }
      },
        {
      test: /\.css$/,
      use: [
        'style-loader',
        {loader: 'css-loader', options: {modules: true, importLoaders: 1}},
      ]
    },
  ];
}

module.exports = config;
