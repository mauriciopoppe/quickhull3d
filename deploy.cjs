const ghpages = require('gh-pages')
const { execSync } = require('node:child_process')

execSync('npm run build', { stdio: 'inherit' })
execSync('cp dist/quickhull3d.js docs/', { stdio: 'inherit' })

ghpages.publish(
  'docs',
  {
    nojekyll: true,
    add: true,
    async beforeAdd() {}
  },
  function () {
    execSync('rm docs/quickhull3d.js', { stdio: 'inherit' })
    console.log('complete!')
  }
)
