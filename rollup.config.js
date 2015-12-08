import babel from 'rollup-plugin-babel'

export default {
  entry: 'lib/index.js',
  dest: 'dist/bundle.js',
  format: 'umd',
  moduleName: 'quickhull3d',
  plugins: [
    babel()
  ]
}

