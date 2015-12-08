import QuickHull from './QuickHull'

export default function runner (points, options = {}) {
  var instance = new QuickHull(points)
  instance.build()
  return instance.collectFaces(options.skipTriangulation)
}

