import QuickHull from './QuickHull'

export default function runner (points, options = {}) {
  const instance = new QuickHull(points)
  instance.build()
  return instance.collectFaces(options.skipTriangulation)
}
