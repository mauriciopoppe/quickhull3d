// NOTE: babel is used for jest but not to build the project with webpack.
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript']
}
