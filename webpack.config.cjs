const path = require('path')
const webpack = require('webpack')

const isProduction = process.env.NODE_ENV === 'production'

const plugins = []
if (isProduction) {
  plugins.push(new webpack.NormalModuleReplacementPlugin(/debug/, './debug.ts'))
}

module.exports = {
  entry: './src/index.ts',
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'nosources-source-map' : 'inline-source-map',
  experiments: {
    outputModule: true
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'quickhull3d.js',
    library: {
      type: 'module'
    }
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins
}
