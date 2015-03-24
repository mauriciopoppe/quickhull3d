/**
 * Created by mauricio on 3/14/15.
 */
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

var args = Array.prototype.slice.call(process.argv, 2);

var QuickHull3d = require('../index');
var fs = require('fs');

var arr = ['100'
  , '1000', '10000', '100000'
];
arr.forEach(function (n) {
  var data = fs.readFileSync('./points' + n + '.json');
  data = JSON.parse(data);
  suite.add(n + ' points', function () {
    QuickHull3d.run(data);
  });
});

suite
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    var data = {
      y: [],  // in ms
      x: [],
      rme: [],
      hz: [],
      name: args[0],
      type: 'scatter'
    };

    for (var i = 0; i < arr.length; i += 1) {
      data.x.push(+arr[i]);
      data.y.push(this[i].times.period * 1000);
      data.hz.push(this[i].hz);
      data.rme.push(this[i].stats.rme)
    }

    fs.appendFileSync('./data/data-v2.json', JSON.stringify(data) + '\n');
  })
  .run({ async: true });
