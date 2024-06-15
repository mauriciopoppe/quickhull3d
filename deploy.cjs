const ghpages = require('gh-pages')
const { execSync } = require('node:child_process')

ghpages.publish('docs', {
  nojekyll: true,
  add: true,
  async beforeAdd () {
    execSync('npm run build')
    execSync('cp dist/quickhull3d.js docs/')
  }
}, function () {
  execSync('rm docs/quickhull3d.js')
  console.log('complete!')
})
