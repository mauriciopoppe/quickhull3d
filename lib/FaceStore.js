/**
 * Created by mauricio on 3/8/15.
 */
var debug = require('debug')('quickhull3d:Face3Store')
var Face = require('./Face')

function Face3Store (owner) {
  this.owner = owner
  this.reset()
}

Face3Store.prototype.create = function (points, i, j, k) {
  var face = new Face(points, i, j, k)
  face.id = this.faceId++
  debug('created a face with indices: [%j, %j, %j], id=%d', i, j, k, face.id)
  this.owner.emit('face:create', face)
  this.allFaces.push(face)
  return face
}

Face3Store.prototype.getFacesNotDestroyed = function () {
  var faces = []
  var i, face
  var LENGTH = this.allFaces.length
  for (i = 0; i < LENGTH; i += 1) {
    face = this.allFaces[i]
    if (!face.destroyed) {
      faces.push(face)
    }
  }
  return faces
}

Face3Store.prototype.reset = function () {
  this.allFaces = []
  this.faceId = 0
}

Face3Store.prototype.destroy = Face3Store.prototype.reset

module.exports = Face3Store
