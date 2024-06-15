const path = require('path')
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: './src/index.ts',
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'nosources-source-map' : 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'quickhull3d.js',
    library: 'quickhull3d',
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  stats: {
    errorDetails: true
  }
}
