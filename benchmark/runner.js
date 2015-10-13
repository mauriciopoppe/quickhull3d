/**
 * Created by mauricio on 3/14/15.
 *
 * usage:
 *
 *  node runner.js && node upload.js
 *
 */
var Benchmark = require('benchmark')
var suite = new Benchmark.Suite()

var QuickHull3d = require('../index')
var convexHull = require('convex-hull')
var fs = require('fs')

var arr = ['100', '1000', '10000', '100000', '200000']
var m = {quickhull3d: 0, convexhull: 1}
var data = Object.keys(m).map(function (v) {
  return {
    y: [],  // in ms
    x: [],
    rme: [],
    hz: [],
    type: 'scatter',
    name: v
  }
})

arr.forEach(function (n) {
  var data = fs.readFileSync('./points' + n + '.json')
  data = JSON.parse(data)
  suite
    .add('quickhull3d:' + n, function () {
      QuickHull3d(data)
    })
    .add('convexhull:' + n, function () {
      convexHull(data)
    })
})

suite
  .on('cycle', function (event) {
    // console.log(event)
    console.log(String(event.target))
    var results = event.target
    var suiteName = event.target.name
    var x = suiteName.split(':')[1]
    var i = m[suiteName.split(':')[0]]
    var datum = data[i]
    datum.x.push(x)
    // https://github.com/bestiejs/benchmark.js/blob/master/benchmark.js#L1545-L1546
    // datum.x.push(results.hz)

    // the time it took for a test to complete in ms
    datum.y.push(results.times.period * 1000)
    datum.rme.push(results.stats.rme)
  })
  .on('complete', function () {
    fs.writeFileSync('./data/data-v3.json', JSON.stringify(data) + '\n')
  })
  .run()
