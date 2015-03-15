/**
 * Created by mauricio on 3/14/15.
 */
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

var QuickHull3d = require('../index');
var fs = require('fs');
var pkg = require('../package.json');

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
    var x = [];
    var y = [];
    var rme = [];
    for (var i = 0; i < arr.length; i += 1) {
      x.push(+arr[i]);
      y.push(this[i].hz);
      rme.push(this[i].stats.rme)
    }

    var data = {
      x: x,
      y: y,
      relativeMarginOfError: rme,
      type: 'scatter'
    };

    fs.appendFileSync('./data/' + pkg.version, '\n' + JSON.stringify(data));
  })
  .run({ async: true });
