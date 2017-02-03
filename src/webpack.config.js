module.exports = {
  entry: './app.jsx',
  output: {
    path: '../public/js',
    filename: 'app.js'
  },
  module: {
  rules: [
    {
      test: /\.jsx$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react']
      }
    }
  ]
  }
}
